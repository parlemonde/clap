import type { ReadableStream } from 'node:stream/web';
import { Readable } from 'stream';

import type { FileData } from '@server/file-upload/file-data.types';

import { getAwsClient } from './awsClient';

const getS3BucketName = (): string => {
    if (!process.env.S3_BUCKET_NAME) {
        throw new Error('S3_BUCKET_NAME must be set to use S3 file storage.');
    }

    return process.env.S3_BUCKET_NAME;
};

const getS3BaseUrl = (): string => {
    if (!process.env.AWS_REGION) {
        throw new Error('AWS_REGION must be set to use S3 file storage.');
    }

    return `https://${getS3BucketName()}.s3.${process.env.AWS_REGION}.amazonaws.com`;
};

export function getS3FileUrl(key: string): string {
    return `${getS3BaseUrl()}/${key}`;
}

const getS3ListUrl = (prefix: string, continuationToken?: string): string => {
    const url = new URL(getS3BaseUrl());
    url.searchParams.set('list-type', '2');
    url.searchParams.set('prefix', prefix);

    if (continuationToken) {
        url.searchParams.set('continuation-token', continuationToken);
    }

    return url.toString();
};

const decodeXml = (value: string): string => {
    return value.replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&apos;', "'");
};

const getXmlValues = (xml: string, tagName: string): string[] => {
    return [...xml.matchAll(new RegExp(`<${tagName}>(.*?)</${tagName}>`, 'gs'))].map((match) => decodeXml(match[1] || ''));
};

const encodeS3CopySource = (key: string): string => {
    const encodedKey = key.split('/').map(encodeURIComponent).join('/');

    return `/${getS3BucketName()}/${encodedKey}`;
};

export async function listS3Files(prefix: string): Promise<string[]> {
    const awsClient = getAwsClient();
    const keys: string[] = [];
    let continuationToken: string | undefined;

    do {
        const response = await awsClient.fetch(getS3ListUrl(prefix, continuationToken), {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`Failed to list S3 files for prefix "${prefix}": ${response.status} ${response.statusText}`);
        }

        const xml = await response.text();
        keys.push(...getXmlValues(xml, 'Key'));
        continuationToken = getXmlValues(xml, 'NextContinuationToken')[0];
    } while (continuationToken);

    return keys;
}

export async function copyS3File(sourceKey: string, destinationKey: string): Promise<void> {
    const awsClient = getAwsClient();
    const response = await awsClient.fetch(getS3FileUrl(destinationKey), {
        method: 'PUT',
        headers: {
            'x-amz-copy-source': encodeS3CopySource(sourceKey),
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to copy S3 file "${sourceKey}" to "${destinationKey}": ${response.status} ${response.statusText}`);
    }
}

export async function deleteS3Files(keys: string[]): Promise<void> {
    const awsClient = getAwsClient();

    for (const key of keys) {
        const response = await awsClient.fetch(getS3FileUrl(key), {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`Failed to delete S3 file "${key}": ${response.status} ${response.statusText}`);
        }
    }
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
            body: filedata as unknown as BodyInit, // TODO: Fix this
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
