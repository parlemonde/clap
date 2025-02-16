import type { Readable } from 'node:stream';
import sanitize from 'sanitize-filename';

import type { FileData } from './file-upload.types';
import { deleteLocalFile, getLocalFile, getLocalFileData, uploadLocalFile } from './local';
import { getCurrentUser } from 'src/actions/get-current-user';
import { deleteS3File, getS3File, getS3FileData, uploadS3File } from 'src/aws/s3';

export type FileType = 'images' | 'audios' | 'locales' | 'zip';

const USE_S3 = process.env.S3_BUCKET_NAME;

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

export async function uploadFile(fileType: FileType, name: string, isForAdmin: boolean, fileData: Buffer, contentType?: string): Promise<string> {
    const fileName = await getFileNameForUpload(fileType, name, isForAdmin);
    if (!fileName) {
        return '';
    }
    if (USE_S3) {
        await uploadS3File(fileName, fileData, contentType);
    } else {
        await uploadLocalFile(fileName, fileData);
    }
    return `/api/${fileName}`;
}

export async function getFileData(fileType: FileType, name: string): Promise<FileData | null> {
    const fileName = await getFileName(fileType, name, 'GET');
    if (!fileName) {
        return null;
    }
    if (USE_S3) {
        return getS3FileData(fileName);
    } else {
        return getLocalFileData(fileName);
    }
}

export async function getFile(fileType: FileType, name: string, range?: string): Promise<Readable | null> {
    const fileName = await getFileName(fileType, name, 'GET');
    if (!fileName) {
        return null;
    }
    if (USE_S3) {
        return getS3File(fileName, range);
    } else {
        return getLocalFile(fileName);
    }
}

export async function deleteFile(fileType: FileType, name: string, isAdmin: boolean): Promise<void> {
    const fileName = await getFileName(fileType, name, 'DELETE');
    if (!fileName || (!fileName.startsWith(`${fileType}/users/`) && !isAdmin)) {
        return;
    }
    if (USE_S3) {
        return deleteS3File(fileName);
    } else {
        return deleteLocalFile(fileName);
    }
}
