import { marshall } from '@aws-sdk/util-dynamodb';

import { awsClient } from './aws-client';

const DYNAMO_DB_URL = `https://dynamodb.${process.env.AWS_REGION}.amazonaws.com`;

interface VideoProgress {
    percentage: number;
    mlt: string;
    s3Key: string;
    status: 'processing' | 'completed' | 'failed';
    expiresAt?: number;
}

export async function startProgress(videoId: string, dynamoDbTable: string, mlt: string, s3Key: string) {
    const progress: VideoProgress = {
        percentage: 0,
        mlt,
        s3Key,
        status: 'processing',
        expiresAt: new Date().getTime() + 1000 * 60 * 60, // 1 hour
    };
    await awsClient.fetch(DYNAMO_DB_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-amz-json-1.0',
            'X-Amz-Target': 'DynamoDB_20120810.PutItem',
        },
        body: JSON.stringify({
            TableName: dynamoDbTable,
            Item: marshall({
                key: videoId,
                value: progress,
            }),
        }),
    });
}

export async function setProgress(videoId: string, dynamoDbTable: string, percentage: number) {
    await awsClient.fetch(DYNAMO_DB_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-amz-json-1.0',
            'X-Amz-Target': 'DynamoDB_20120810.UpdateItem',
        },
        body: JSON.stringify({
            TableName: dynamoDbTable,
            Key: marshall({
                key: videoId,
            }),
            UpdateExpression: 'SET #v.percentage = :percentage',
            ExpressionAttributeNames: { '#v': 'value' },
            ExpressionAttributeValues: marshall({
                ':percentage': percentage,
            }),
        }),
    });
}

export async function setCompleted(videoId: string, dynamoDbTable: string, success: boolean) {
    await awsClient.fetch(DYNAMO_DB_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-amz-json-1.0',
            'X-Amz-Target': 'DynamoDB_20120810.UpdateItem',
        },
        body: JSON.stringify({
            TableName: dynamoDbTable,
            Key: marshall({
                key: videoId,
            }),
            UpdateExpression: 'SET #v.#s = :status, #v.percentage = :percentage',
            ExpressionAttributeNames: { '#v': 'value', '#s': 'status' },
            ExpressionAttributeValues: marshall({
                ':status': success ? 'completed' : 'failed',
                ':percentage': 100,
            }),
        }),
    });
}
