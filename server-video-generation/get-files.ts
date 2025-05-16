import fs from 'fs-extra';
import path from 'path';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import type { ReadableStream } from 'stream/web';

import { awsClient } from './aws-client';
import type { File } from './types';

async function downloadFile(dir: string, file: File, isS3: boolean) {
    try {
        const response = isS3 ? await awsClient.fetch(file.path) : await fetch(file.path);
        if (response.ok && response.body) {
            const filePath = path.join(dir, file.name);
            const fileStream = fs.createWriteStream(filePath, {
                flags: 'wx',
            });
            await finished(Readable.fromWeb(response.body as ReadableStream).pipe(fileStream));
        } else {
            console.warn(`Failed to download file ${file.name}`);
        }
    } catch {
        console.warn(`Failed to download file ${file.name}`);
    }
}

export async function getFiles(dir: string, s3Files: File[], httpFiles: File[]) {
    // Download per batch of 5 files
    for (let i = 0; i < s3Files.length; i += 5) {
        const batch = s3Files.slice(i, i + 5);
        await Promise.all(batch.map((file) => downloadFile(dir, file, true)));
    }
    for (let i = 0; i < httpFiles.length; i += 5) {
        const batch = httpFiles.slice(i, i + 5);
        await Promise.all(batch.map((file) => downloadFile(dir, file, false)));
    }
}
