'use server';

import mime from 'mime-types';
import path from 'node:path';
import type { ReadableStream } from 'node:stream/web';
import { Readable } from 'stream';
import { v4 } from 'uuid';

import { getAwsClient } from './awsClient';
import type { FileData } from 'src/actions/files/file-data.types';
import { USE_S3 } from 'src/actions/files/file-upload';
import { getCurrentUser } from 'src/actions/get-current-user';

const S3_BASE_URL = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;
function getS3FileUrl(key: string): string {
    return `${S3_BASE_URL}/${key}`;
}

export async function getS3File(key: string, range?: string): Promise<Readable | null> {
    try {
        const awsClient = getAwsClient();
        const response = await awsClient.fetch(getS3FileUrl(key), {
            method: 'GET',
            headers: range ? { Range: range } : {},
        });
        if (response.ok) {
            return response.body === null ? null : Readable.fromWeb(response.body as ReadableStream);
        }
        return null;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function getS3FileData(key: string): Promise<FileData | null> {
    try {
        const awsClient = getAwsClient();
        const response = await awsClient.fetch(getS3FileUrl(key), {
            method: 'HEAD',
        });
        if (response.ok) {
            return {
                AcceptRanges: response.headers.get('Accept-Ranges') || 'bytes',
                LastModified: new Date(response.headers.get('Last-Modified') || ''),
                ContentLength: Number(response.headers.get('Content-Length')),
                ContentType: response.headers.get('Content-Type') || '',
            };
        }
        return null;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function uploadS3File(key: string, filedata: Buffer, contentType?: string): Promise<void> {
    try {
        const awsClient = getAwsClient();
        await awsClient.fetch(getS3FileUrl(key), {
            method: 'PUT',
            body: filedata,
            headers: {
                'Content-Length': filedata.length.toString(),
                'Content-Type': contentType || 'binary/octet-stream',
            },
        });
    } catch (e) {
        console.error(e);
    }
}

export async function deleteS3File(key: string): Promise<void> {
    try {
        const awsClient = getAwsClient();
        await awsClient.fetch(getS3FileUrl(key), {
            method: 'DELETE',
        });
    } catch (e) {
        console.error(e);
    }
}

export async function getS3UploadParameters(fileName: string): Promise<{ formParameters: Record<string, string>; s3Url: string } | false> {
    if (!USE_S3) {
        return false;
    }

    const currentUser = await getCurrentUser();
    const uuid = v4();
    const extension = path.extname(fileName).substring(1);
    const key = currentUser ? `audios/users/${currentUser?.id}/${uuid}.${extension}` : `audios/temp/${uuid}.${extension}`;
    const contentType = mime.lookup(key) || undefined;

    if (!contentType || !contentType.startsWith('audio/')) {
        throw new Error('Invalid file');
    }

    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.S3_BUCKET_NAME || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION) {
        throw new Error('Unauthorized');
    }

    const currentDate = `${new Date().toISOString().slice(0, -5).replaceAll(/[-:.]/g, '')}Z`;
    const expirationDate = new Date(Date.now() + 1000 * 60 * 5); // 5 minutes

    const algorithm = 'AWS4-HMAC-SHA256';
    const credential = `${process.env.AWS_ACCESS_KEY_ID}/${currentDate.split('T')[0]}/${process.env.AWS_REGION}/s3/aws4_request`;

    const policy = {
        expiration: `${expirationDate.toISOString().slice(0, -5)}Z`,
        conditions: [
            {
                bucket: process.env.S3_BUCKET_NAME,
            },
            {
                key,
            },
            {
                'Content-Type': contentType,
            },
            ['content-length-range', 0, 50 * 1024 * 1024],
            {
                'X-Amz-Algorithm': algorithm,
            },
            {
                'X-Amz-Credential': credential,
            },
            {
                'X-Amz-Date': currentDate,
            },
        ] as Array<(string | number)[] | Record<string, string>>,
    };
    if (process.env.AWS_SESSION_TOKEN) {
        policy.conditions.push({
            'X-Amz-Security-Token': process.env.AWS_SESSION_TOKEN,
        });
    }
    const base64Policy = Buffer.from(JSON.stringify(policy)).toString('base64');

    // Signature
    const kDate = await hmac('AWS4' + process.env.AWS_SECRET_ACCESS_KEY, currentDate.split('T')[0]);
    const kRegion = await hmac(kDate, process.env.AWS_REGION);
    const kService = await hmac(kRegion, 's3');
    const kCredentials = await hmac(kService, 'aws4_request');
    const signature = await hmac(kCredentials, base64Policy);

    const formParameters: Record<string, string> = {
        bucket: process.env.S3_BUCKET_NAME,
        key,
        'Content-Type': contentType,
        'X-Amz-Algorithm': algorithm,
        'X-Amz-Credential': credential,
        'X-Amz-Date': currentDate,
    };
    if (process.env.AWS_SESSION_TOKEN) {
        formParameters['X-Amz-Security-Token'] = process.env.AWS_SESSION_TOKEN;
    }
    formParameters.Policy = base64Policy;
    formParameters['X-Amz-Signature'] = buf2hex(signature);
    return { formParameters, s3Url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/` };
}

const encoder = new TextEncoder();

async function hmac(key: string | ArrayBuffer, string: string) {
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        typeof key === 'string' ? encoder.encode(key) : key,
        { name: 'HMAC', hash: { name: 'SHA-256' } },
        false,
        ['sign'],
    );
    return crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(string));
}
const HEX_CHARS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
function buf2hex(arrayBuffer: ArrayBuffer) {
    const buffer = new Uint8Array(arrayBuffer);
    let out = '';
    for (let idx = 0; idx < buffer.length; idx++) {
        const n = buffer[idx];
        out += HEX_CHARS[(n >>> 4) & 0xf];
        out += HEX_CHARS[n & 0xf];
    }
    return out;
}
