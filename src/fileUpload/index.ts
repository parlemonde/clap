import sanitize from 'sanitize-filename';
import type { Readable } from 'stream';

import { localStorageProvider } from './local';
import type { FileData } from './provider';
import { s3StorageProvider } from './s3';

export type FileType = 'images' | 'audios' | 'locales';

const PROVIDER_NAME = (process.env.PROVIDER_NAME || 'local').toLowerCase();
const USE_S3 = PROVIDER_NAME === 's3' || PROVIDER_NAME === 'minio';

const getFileName = (fileType: FileType, name: string) => `${fileType}/${sanitize(name)}`;

export async function uploadFile(fileType: FileType, name: string, fileData: Buffer): Promise<string> {
    const fileName = getFileName(fileType, name);
    if (USE_S3) {
        await s3StorageProvider.uploadFile(fileName, fileData);
    } else {
        await localStorageProvider.uploadFile(fileName, fileData);
    }
    return `/api/${fileName}`;
}

export function getFileData(fileType: FileType, name: string): Promise<FileData | null> {
    const fileName = getFileName(fileType, name);
    if (USE_S3) {
        return s3StorageProvider.getFileData(fileName);
    } else {
        return localStorageProvider.getFileData(fileName);
    }
}

export function getFile(fileType: FileType, name: string, range?: string): Promise<Readable | null> {
    const fileName = getFileName(fileType, name);
    if (USE_S3) {
        return s3StorageProvider.getFile(fileName, range);
    } else {
        return localStorageProvider.getFile(fileName, range);
    }
}

export function deleteFile(fileType: FileType, name: string): Promise<void> {
    const fileName = getFileName(fileType, name);
    if (USE_S3) {
        return s3StorageProvider.deleteFile(fileName);
    } else {
        return localStorageProvider.deleteFile(fileName);
    }
}
