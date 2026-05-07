import { createHmac, timingSafeEqual } from 'node:crypto';

type HmacKey = string | Buffer;

export function hmacSha256(key: HmacKey, value: string): Buffer {
    return createHmac('sha256', key).update(value).digest();
}

export function hmacSha256Hex(key: HmacKey, value: string): string {
    return createHmac('sha256', key).update(value).digest('hex');
}

export function constantTimeEqualHex(actual: string, expected: string): boolean {
    if (!/^[a-f0-9]+$/i.test(actual) || !/^[a-f0-9]+$/i.test(expected) || actual.length !== expected.length || actual.length % 2 !== 0) {
        return false;
    }

    return timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'));
}
