import sanitize from 'sanitize-filename';
import type { Readable } from 'stream';

import { localStorageProvider } from './local';
import type { FileData } from './provider';
import { s3StorageProvider } from './s3';
import { getCurrentUser } from 'src/actions/get-current-user';

export type FileType = 'images' | 'audios' | 'locales' | 'zip';

const PROVIDER_NAME = (process.env.PROVIDER_NAME || 'local').toLowerCase();
const USE_S3 = PROVIDER_NAME === 's3' || PROVIDER_NAME === 'minio';

async function getFileNameForUpload(fileType: FileType, name: string, isForAdmin: boolean): Promise<string | null> {
    if (!isForAdmin) {
        return `${fileType}/users/${sanitize(name)}`;
    }
    if ((await getCurrentUser())?.role === 'admin') {
        return `${fileType}/${sanitize(name)}`;
    }
    return null; // Unauthorized to access
}

async function getFileName(fileType: FileType, name: string, action: 'GET' | 'DELETE'): Promise<string | null> {
    if (name.indexOf('/') === -1) {
        if (action === 'GET') {
            return `${fileType}/${sanitize(name)}`;
        }
        if ((await getCurrentUser())?.role === 'admin') {
            return `${fileType}/${sanitize(name)}`;
        }
        return null; // Unauthorized to access
    }
    const [path, filename] = name.split('/');
    if (path === 'users') {
        return `${fileType}/users/${sanitize(filename)}`;
    }
    return null; // Invalid path
}

export async function uploadFile(fileType: FileType, name: string, isForAdmin: boolean, fileData: Buffer): Promise<string> {
    const fileName = await getFileNameForUpload(fileType, name, isForAdmin);
    if (!fileName) {
        return '';
    }
    if (USE_S3) {
        await s3StorageProvider.uploadFile(fileName, fileData);
    } else {
        await localStorageProvider.uploadFile(fileName, fileData);
    }
    return `/api/${fileName}`;
}

export async function getFileData(fileType: FileType, name: string): Promise<FileData | null> {
    const fileName = await getFileName(fileType, name, 'GET');
    if (!fileName) {
        return null;
    }
    if (USE_S3) {
        return s3StorageProvider.getFileData(fileName);
    } else {
        return localStorageProvider.getFileData(fileName);
    }
}

export async function getFile(fileType: FileType, name: string, range?: string): Promise<Readable | null> {
    const fileName = await getFileName(fileType, name, 'GET');
    if (!fileName) {
        return null;
    }
    if (USE_S3) {
        return s3StorageProvider.getFile(fileName, range);
    } else {
        return localStorageProvider.getFile(fileName, range);
    }
}

export async function deleteFile(fileType: FileType, name: string, isAdmin: boolean): Promise<void> {
    const fileName = await getFileName(fileType, name, 'DELETE');
    if (!fileName || (!fileName.startsWith(`${fileType}/users/`) && !isAdmin)) {
        return;
    }
    if (USE_S3) {
        return s3StorageProvider.deleteFile(fileName);
    } else {
        return localStorageProvider.deleteFile(fileName);
    }
}
