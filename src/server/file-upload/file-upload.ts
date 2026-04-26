import type { Readable } from 'node:stream';

import { deleteS3File, getS3File, getS3FileData, uploadS3File } from '@server/aws/s3';
import { getEnvVariable } from '@server/get-env-variable';

import type { FileData } from './file-data.types';
import { deleteLocalFile, getLocalFile, getLocalFileData, uploadLocalFile } from './local';
import type { ByteRange } from './range-request';

export const USE_S3 = getEnvVariable('S3_BUCKET_NAME') !== '';

export async function uploadFile(fileName: string, fileData: Buffer, contentType?: string): Promise<void> {
    if (!fileName) {
        return;
    }
    if (USE_S3) {
        await uploadS3File(fileName, fileData, contentType);
    } else {
        await uploadLocalFile(fileName, fileData);
    }
}

export async function getFileData(fileName: string): Promise<FileData | null> {
    if (!fileName) {
        return null;
    }
    if (USE_S3) {
        return getS3FileData(fileName);
    } else {
        return getLocalFileData(fileName);
    }
}

export async function getFile(fileName: string, range?: ByteRange): Promise<Readable | null> {
    if (!fileName) {
        return null;
    }
    if (USE_S3) {
        return getS3File(fileName, range);
    } else {
        return getLocalFile(fileName);
    }
}

export async function deleteFile(fileName: string): Promise<void> {
    if (!fileName) {
        return;
    }
    if (USE_S3) {
        return deleteS3File(fileName);
    } else {
        return deleteLocalFile(fileName);
    }
}
