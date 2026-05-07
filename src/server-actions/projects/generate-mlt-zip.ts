'use server';

import archiver from 'archiver';
import fs from 'fs-extra';
import http from 'node:http';
import path from 'node:path';
import type internal from 'node:stream';
import { v4 } from 'uuid';

import type { ProjectData } from '@server/database/schemas/projects';
import { getFile, uploadFile } from '@server/file-upload/file-upload';
import { logger } from '@server/logger';

import type { File } from './project-to-mlt';
import { projectToMlt } from './project-to-mlt';

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
    const temporaryDirectory = path.join(process.cwd(), 'tmp');
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
            logger.error(err);
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
                logger.error(err);
            })
            .finally(() => {
                archive.finalize().catch(logger.error);
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

export async function getMltArchiveData(
    project: ProjectData,
    name: string,
    extensionHints?: Record<string, string>,
): Promise<{ mltStr: string; files: Array<{ sourceUrl: string; fileName: string }> }> {
    const { mltStr, files } = await projectToMlt(project, name, 'local', extensionHints);
    return {
        mltStr,
        files: files.map(({ sourceUrl, fileName }) => ({ sourceUrl, fileName })),
    };
}
