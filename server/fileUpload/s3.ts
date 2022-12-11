import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { S3ClientConfig } from '@aws-sdk/client-s3';
import type { Readable } from 'stream';

import { logger } from '../lib/logger';
import type { FileStorageProvider, FileData } from './provider';

const STOCKAGE_PROVIDER_NAME = (process.env.STOCKAGE_PROVIDER_NAME || 'local').toLowerCase();
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || '';
const S3_CONFIG: S3ClientConfig = {
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || '',
        secretAccessKey: process.env.S3_SECRET_KEY || '',
    },
    endpoint: STOCKAGE_PROVIDER_NAME === 'minio' ? 'http://localhost:9000' : undefined,
    forcePathStyle: true,
};
const S3_CLIENT = new S3Client(S3_CONFIG);

export const s3StorageProvider: FileStorageProvider = {
    getFileData: async function (fileUrl: string): Promise<FileData | null> {
        try {
            const headObjectCommand = new HeadObjectCommand({ Bucket: S3_BUCKET_NAME, Key: fileUrl });
            const response = await S3_CLIENT.send(headObjectCommand);
            return {
                AcceptRanges: response.AcceptRanges || 'bytes',
                LastModified: response.LastModified || new Date(),
                ContentLength: response.ContentLength || 0,
                ContentType: response.ContentType || '',
            };
        } catch (e) {
            logger.error(`Could not get data for ${fileUrl}.`);
            return null;
        }
    },
    getFile: async function (fileUrl: string, range?: string): Promise<Readable | null> {
        try {
            const getObjectCommand = new GetObjectCommand({ Bucket: S3_BUCKET_NAME, Key: fileUrl, Range: range });
            const response = await S3_CLIENT.send(getObjectCommand);
            return response.Body as Readable;
        } catch (e) {
            logger.error(`Could not get ${fileUrl}.`);
            return null;
        }
    },
    uploadFile: async function (fileUrl: string, filedata: Buffer): Promise<void> {
        const putObjectCommand = new PutObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: fileUrl,
            Body: filedata,
        });
        await S3_CLIENT.send(putObjectCommand);
    },
    deleteFile: async function (fileUrl: string): Promise<void> {
        const deleteObjectCommand = new DeleteObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: fileUrl,
        });
        await S3_CLIENT.send(deleteObjectCommand);
    },
};
