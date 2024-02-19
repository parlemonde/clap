import type { Readable } from 'stream';

export function getBufferFromStream(stream: Readable | null): Promise<Buffer | null> {
    if (stream === null) {
        return Promise.resolve(null);
    }
    return new Promise<Buffer | null>((resolve) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.once('end', () => resolve(Buffer.concat(chunks)));
        stream.once('error', () => resolve(null));
    });
}
