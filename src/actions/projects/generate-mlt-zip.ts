'use server';

import archiver from 'archiver';
import fs from 'fs-extra';
import http from 'node:http';
import path, { dirname } from 'node:path';
import type internal from 'node:stream';
import { fileURLToPath } from 'node:url';
import { v4 } from 'uuid';

import type { File } from './project-to-mlt';
import { projectToMlt } from './project-to-mlt';
import { getFile, uploadFile } from 'src/fileUpload';
import type { LocalProject } from 'src/hooks/useLocalStorage/local-storage';

async function getFileStream(file: File): Promise<internal.Readable | null> {
    if (file.isLocal) {
        return getFile(file.fileType, file.name);
    } else {
        return new Promise<http.IncomingMessage>((resolve) => http.get(file.name, resolve));
    }
}

export async function getMltZip(project: LocalProject) {
    const { mlt, files } = await projectToMlt(project, 'local');

    const id: string = v4();
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const directory: string = path.join(__dirname, 'temp', id);
    await fs.mkdirs(directory);

    // Create Zip file.
    await new Promise<void>((resolve) => {
        // Create output zip file-stream.
        const output = fs.createWriteStream(path.join(directory, `Montage.zip`));
        const archive = archiver('zip');
        archive.pipe(output);

        // Resolve on close.
        output.on('close', resolve);

        // Resolve on error.
        archive.on('error', (err) => {
            console.error(err);
            resolve();
        });

        // Add files to the archive.
        archive.append(mlt, { name: 'Montage.mlt' });
        Promise.allSettled(files.map(getFileStream))
            .then((streamResults) => {
                for (let i = 0; i < files.length; i++) {
                    const result = streamResults[i];
                    if (result.status === 'fulfilled' && result.value !== null) {
                        archive.append(result.value, { name: files[i].name.replace(/^users\//, '') });
                    }
                }
            })
            .catch((err) => {
                console.error(err);
            })
            .finally(() => {
                archive.finalize().catch(console.error);
            });
    });

    // Push to S3.
    const fileBuffer = await fs.readFile(path.join(directory, `Montage.zip`));
    await uploadFile('zip', `${id}.zip`, false, fileBuffer);

    // Delete temp directory.
    await fs.remove(directory);

    // Return the URL.
    return `/api/zip/${id}/Montage.zip`;
}
