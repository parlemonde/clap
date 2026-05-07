'use server';

import mime from 'mime-types';
import path from 'node:path';
import { v4 } from 'uuid';

import { getCurrentUser } from '@server/auth/get-current-user';
import { hmacSha256, hmacSha256Hex } from '@server/crypto/hmac';
import { isUsingS3 } from '@server/file-upload/file-upload';
import { getEnvVariable } from '@server/get-env-variable';

export async function getS3UploadParameters(fileName: string): Promise<{ formParameters: Record<string, string>; s3Url: string } | false> {
    if (!isUsingS3()) {
        return false;
    }

    const currentUser = await getCurrentUser();
    const uuid = v4();
    const extension = path.extname(fileName).substring(1);
    const userAudioId = currentUser?.role === 'student' ? currentUser.teacherId : currentUser?.id;
    const key = userAudioId ? `media/audios/users/${userAudioId}/${uuid}.${extension}` : `media/audios/tmp/${uuid}.${extension}`;
    const contentType = mime.lookup(key) || undefined;

    if (!contentType || !contentType.startsWith('audio/')) {
        throw new Error('Invalid file');
    }

    const awsAccessKeyId = getEnvVariable('AWS_ACCESS_KEY_ID');
    const awsSecretAccessKey = getEnvVariable('AWS_SECRET_ACCESS_KEY');
    const awsRegion = getEnvVariable('AWS_REGION');
    const s3BucketName = getEnvVariable('S3_BUCKET_NAME');
    const awsSessionToken = getEnvVariable('AWS_SESSION_TOKEN');

    if (!awsAccessKeyId || !s3BucketName || !awsSecretAccessKey || !awsRegion) {
        throw new Error('Unauthorized');
    }

    const currentDate = `${new Date().toISOString().slice(0, -5).replaceAll(/[-:.]/g, '')}Z`;
    const expirationDate = new Date(Date.now() + 1000 * 60 * 5); // 5 minutes

    const algorithm = 'AWS4-HMAC-SHA256';
    const credential = `${awsAccessKeyId}/${currentDate.split('T')[0]}/${awsRegion}/s3/aws4_request`;

    const policy = {
        expiration: `${expirationDate.toISOString().slice(0, -5)}Z`,
        conditions: [
            {
                bucket: s3BucketName,
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
    if (awsSessionToken) {
        policy.conditions.push({
            'X-Amz-Security-Token': awsSessionToken,
        });
    }
    const base64Policy = Buffer.from(JSON.stringify(policy)).toString('base64');

    const kDate = hmacSha256('AWS4' + awsSecretAccessKey, currentDate.split('T')[0]);
    const kRegion = hmacSha256(kDate, awsRegion);
    const kService = hmacSha256(kRegion, 's3');
    const kCredentials = hmacSha256(kService, 'aws4_request');
    const signature = hmacSha256Hex(kCredentials, base64Policy);

    const formParameters: Record<string, string> = {
        bucket: s3BucketName,
        key,
        'Content-Type': contentType,
        'X-Amz-Algorithm': algorithm,
        'X-Amz-Credential': credential,
        'X-Amz-Date': currentDate,
    };
    if (awsSessionToken) {
        formParameters['X-Amz-Security-Token'] = awsSessionToken;
    }
    formParameters.Policy = base64Policy;
    formParameters['X-Amz-Signature'] = signature;
    return { formParameters, s3Url: `https://${s3BucketName}.s3.${awsRegion}.amazonaws.com/` };
}
