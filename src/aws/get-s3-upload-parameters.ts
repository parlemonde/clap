'use server';

import mime from 'mime-types';
import path from 'node:path';
import { v4 } from 'uuid';

import { hmac, buf2hex } from './utils';
import { USE_S3 } from 'src/actions/files/file-upload';
import { getCurrentUser } from 'src/actions/get-current-user';

export async function getS3UploadParameters(fileName: string): Promise<{ formParameters: Record<string, string>; s3Url: string } | false> {
    if (!USE_S3) {
        return false;
    }

    const currentUser = await getCurrentUser();
    const uuid = v4();
    const extension = path.extname(fileName).substring(1);
    const key = currentUser ? `media/audios/users/${currentUser?.id}/${uuid}.${extension}` : `media/audios/temp/${uuid}.${extension}`;
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
