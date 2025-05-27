'use server';

import archiver from 'archiver';
import fs from 'fs-extra';
import http from 'node:http';
import path from 'node:path';
import type internal from 'node:stream';
import { v4 } from 'uuid';

import type { File } from './project-to-mlt';
import { projectToMlt } from './project-to-mlt';
import { getFile, uploadFile } from 'src/actions/files/file-upload';
import type { ProjectData } from 'src/database/schemas/projects';

async function getFileStream(file: File): Promise<internal.Readable | null> {
    if (file.isLocal) {
        return getFile(file.fileUrl);
    } else {
        return new Promise<http.IncomingMessage>((resolve) => http.get(file.fileUrl, resolve));
    }
}

export async function getMltZip(project: ProjectData, name: string) {
    const { mltStr, files } = await projectToMlt(project, name, 'local');

    const id: string = v4();
    const temporaryDirectory = process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined ? '/tmp' : path.join(process.cwd(), 'tmp');
    const directory: string = path.join(temporaryDirectory, id);
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
        archive.append(mltStr, { name: 'Montage.mlt' });
        Promise.allSettled(files.map(getFileStream))
            .then((streamResults) => {
                for (let i = 0; i < files.length; i++) {
                    const result = streamResults[i];
                    if (result.status === 'fulfilled' && result.value !== null) {
                        archive.append(result.value, { name: files[i].fileName });
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
    const fileName = `media/zip/${id}/Montage.zip`;
    await uploadFile(fileName, fileBuffer, 'application/zip');

    // Delete temp directory.
    await fs.remove(directory);

    // Return the URL.
    return `/${fileName}`;
}
