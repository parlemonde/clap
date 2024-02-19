import fs from 'fs-extra';
import mime from 'mime-types';
import path from 'path';
import type { Readable } from 'stream';

import type { FileStorageProvider, FileData } from './provider';

const getFilePath = (fileUrl: string) => path.join(__dirname, '../..', 'files', fileUrl);

export const localStorageProvider: FileStorageProvider = {
    getFileData: async function (fileUrl: string): Promise<FileData | null> {
        try {
            const stats = fs.statSync(getFilePath(fileUrl));
            return {
                AcceptRanges: 'none',
                ContentLength: stats.size,
                ContentType: mime.lookup(fileUrl) || '',
                LastModified: stats.mtime,
            };
        } catch (e) {
            return null;
        }
    },
    getFile: async function (fileUrl: string): Promise<Readable | null> {
        try {
            return fs.createReadStream(getFilePath(fileUrl));
        } catch (e) {
            console.error(`File ${fileUrl} not found !`);
        }
        return null;
    },
    uploadFile: async function (fileUrl: string, filedata: Buffer): Promise<void> {
        const previousFolders = fileUrl.split('/').slice(0, -1).join('/');
        const directory = path.join(__dirname, '../..', 'files', previousFolders);
        await fs.mkdirs(directory);
        await fs.writeFile(getFilePath(fileUrl), filedata);
    },
    deleteFile: async function (fileUrl: string): Promise<void> {
        await fs.remove(getFilePath(fileUrl));
    },
};
