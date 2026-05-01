#!/usr/bin/env node

const crypto = require('node:crypto');
const http = require('node:http');

try {
    process.loadEnvFile?.();
} catch {
    // Optional convenience for local dev; explicit environment variables still win.
}

const MAX_MESSAGE_SIZE = 65_536;
const MAX_ROOM_NAME_LENGTH = 128;
const AUTH_PROTOCOL_PREFIX = 'auth.';
const DEFAULT_ROOM = 'none';
const PORT = Number(process.env.PORT || 9000);
const APP_SECRET = process.env.COLLABORATION_SERVER_SECRET || process.env.APP_SECRET || '1234';

const rooms = new Map();

if (!APP_SECRET) {
    console.error('COLLABORATION_SERVER_SECRET or APP_SECRET must be set');
    process.exit(1);
}

const server = http.createServer((_req, res) => {
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.end('OK\n');
});

server.on('upgrade', (req, socket) => {
    const auth = resolveClientAuth(req);
    if (!auth.ok) {
        reject(socket, auth.status, auth.message);
        return;
    }

    if (!isValidRoomName(auth.room)) {
        reject(socket, 400, 'Invalid room name');
        return;
    }

    if (!checkSignature(auth.room, auth.date, auth.signature)) {
        reject(socket, 401, 'Unauthorized');
        return;
    }

    const key = req.headers['sec-websocket-key'];
    if (typeof key !== 'string') {
        reject(socket, 400, 'Missing websocket key');
        return;
    }

    const accept = crypto
        .createHash('sha1')
        .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
        .digest('base64');
    const selectedProtocol = getProtocols(req).includes('json') ? '\r\nSec-WebSocket-Protocol: json' : '';

    socket.write(
        'HTTP/1.1 101 Switching Protocols\r\n' +
            'Upgrade: websocket\r\n' +
            'Connection: Upgrade\r\n' +
            `Sec-WebSocket-Accept: ${accept}` +
            selectedProtocol +
            '\r\n\r\n',
    );

    addClient(auth.room, socket);
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Dev websocket server listening on ws://localhost:${PORT}`);
});

function addClient(room, socket) {
    const clients = rooms.get(room) || new Set();
    clients.add(socket);
    rooms.set(room, clients);

    let buffer = Buffer.alloc(0);

    socket.on('data', (chunk) => {
        buffer = Buffer.concat([buffer, chunk]);

        while (buffer.length > 0) {
            const frame = readFrame(buffer);
            if (!frame) {
                break;
            }

            buffer = buffer.subarray(frame.bytes);

            if (frame.close) {
                socket.end();
                break;
            }

            if (frame.text !== undefined) {
                broadcast(room, socket, frame.text);
            }
        }
    });

    socket.on('close', () => removeClient(room, socket));
    socket.on('error', () => removeClient(room, socket));
}

function removeClient(room, socket) {
    const clients = rooms.get(room);
    if (!clients) {
        return;
    }

    clients.delete(socket);
    if (clients.size === 0) {
        rooms.delete(room);
    }
}

function broadcast(room, sender, message) {
    const clients = rooms.get(room);
    if (!clients) {
        return;
    }

    const frame = writeTextFrame(message);
    for (const client of clients) {
        if (client !== sender && !client.destroyed) {
            client.write(frame);
        }
    }
}

function readFrame(buffer) {
    if (buffer.length < 2) {
        return undefined;
    }

    const opcode = buffer[0] & 0x0f;
    const masked = (buffer[1] & 0x80) !== 0;
    let length = buffer[1] & 0x7f;
    let offset = 2;

    if (length === 126) {
        if (buffer.length < offset + 2) {
            return undefined;
        }
        length = buffer.readUInt16BE(offset);
        offset += 2;
    } else if (length === 127) {
        if (buffer.length < offset + 8) {
            return undefined;
        }

        const bigLength = buffer.readBigUInt64BE(offset);
        if (bigLength > BigInt(MAX_MESSAGE_SIZE)) {
            return { bytes: buffer.length, close: true };
        }

        length = Number(bigLength);
        offset += 8;
    }

    if (!masked || length > MAX_MESSAGE_SIZE) {
        return { bytes: buffer.length, close: true };
    }

    if (buffer.length < offset + 4 + length) {
        return undefined;
    }

    const mask = buffer.subarray(offset, offset + 4);
    offset += 4;

    const payload = Buffer.alloc(length);
    for (let index = 0; index < length; index += 1) {
        payload[index] = buffer[offset + index] ^ mask[index % 4];
    }

    const bytes = offset + length;

    if (opcode === 0x8) {
        return { bytes, close: true };
    }

    if (opcode !== 0x1) {
        return { bytes };
    }

    return { bytes, text: payload.toString('utf8') };
}

function writeTextFrame(message) {
    const payload = Buffer.from(message, 'utf8');
    if (payload.length <= 125) {
        return Buffer.concat([Buffer.from([0x81, payload.length]), payload]);
    }

    if (payload.length <= 65_535) {
        const header = Buffer.alloc(4);
        header[0] = 0x81;
        header[1] = 126;
        header.writeUInt16BE(payload.length, 2);
        return Buffer.concat([header, payload]);
    }

    const longHeader = Buffer.alloc(10);
    longHeader[0] = 0x81;
    longHeader[1] = 127;
    longHeader.writeBigUInt64BE(BigInt(payload.length), 2);
    return Buffer.concat([longHeader, payload]);
}

function resolveClientAuth(req) {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const room = url.searchParams.get('room') || DEFAULT_ROOM;
    const date = getHeader(req, 'x-date') || url.searchParams.get('date') || '';
    const headerSignature = getHeader(req, 'authorization');
    const protocolSignature = getProtocolAuthSignature(req);

    if (!protocolSignature.ok) {
        return protocolSignature;
    }

    return {
        ok: true,
        room,
        date,
        signature: headerSignature || protocolSignature.signature || '',
    };
}

function getProtocolAuthSignature(req) {
    let signature;

    for (const protocol of getProtocols(req)) {
        if (!protocol.startsWith(AUTH_PROTOCOL_PREFIX)) {
            continue;
        }

        const candidate = protocol.slice(AUTH_PROTOCOL_PREFIX.length);
        if (!candidate || !/^[a-f0-9]+$/i.test(candidate)) {
            return { ok: false, status: 400, message: 'Invalid auth protocol value' };
        }

        if (signature !== undefined) {
            return { ok: false, status: 400, message: 'Multiple auth protocol values' };
        }

        signature = candidate;
    }

    return { ok: true, signature };
}

function getProtocols(req) {
    const header = getHeader(req, 'sec-websocket-protocol') || '';
    return header
        .split(',')
        .map((protocol) => protocol.trim())
        .filter(Boolean);
}

function checkSignature(room, date, signature) {
    const clientTime = Date.parse(date);
    if (!Number.isFinite(clientTime)) {
        return false;
    }

    const age = Date.now() - clientTime;
    if (age < 0 || age > 4 * 60 * 60 * 1000) {
        return false;
    }

    const secretKey = `secret:${APP_SECRET}`;
    const dateKey = crypto.createHmac('sha256', secretKey).update(date).digest();
    const expected = crypto.createHmac('sha256', dateKey).update(room).digest('hex');

    return constantTimeEqualHex(signature, expected);
}

function constantTimeEqualHex(actual, expected) {
    if (!/^[a-f0-9]+$/i.test(actual) || actual.length !== expected.length) {
        return false;
    }

    return crypto.timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'));
}

function isValidRoomName(name) {
    return name.length > 0 && name.length <= MAX_ROOM_NAME_LENGTH && /^[a-z0-9_-]+$/i.test(name);
}

function getHeader(req, name) {
    const value = req.headers[name];
    if (Array.isArray(value)) {
        return value[0]?.trim() || undefined;
    }

    return value?.trim() || undefined;
}

function reject(socket, status, message) {
    socket.write(`HTTP/1.1 ${status} ${message}\r\nConnection: close\r\n\r\n${message}`);
    socket.destroy();
}
