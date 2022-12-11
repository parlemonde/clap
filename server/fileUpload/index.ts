import type { Readable } from 'stream';

import { localStorageProvider } from './local';
import type { FileData } from './provider';
import { s3StorageProvider } from './s3';

const STOCKAGE_PROVIDER_NAME = (process.env.STOCKAGE_PROVIDER_NAME || 'local').toLowerCase();
const USE_S3 = STOCKAGE_PROVIDER_NAME === 's3' || STOCKAGE_PROVIDER_NAME === 'minio';

export async function uploadFile(fileName: string, fileData: Buffer): Promise<string> {
    if (USE_S3) {
        await s3StorageProvider.uploadFile(fileName, fileData);
    } else {
        await localStorageProvider.uploadFile(fileName, fileData);
    }
    return `/api/${fileName}`;
}

export function getFileData(fileUrl: string): Promise<FileData | null> {
    if (USE_S3) {
        return s3StorageProvider.getFileData(fileUrl);
    } else {
        return localStorageProvider.getFileData(fileUrl);
    }
}

export function getFile(fileUrl: string, range?: string): Promise<Readable | null> {
    if (USE_S3) {
        return s3StorageProvider.getFile(fileUrl, range);
    } else {
        return localStorageProvider.getFile(fileUrl, range);
    }
}

export function deleteFile(fileUrl: string): Promise<void> {
    if (USE_S3) {
        return s3StorageProvider.deleteFile(fileUrl);
    } else {
        return localStorageProvider.deleteFile(fileUrl);
    }
}
