'use server';

import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { getAwsClient } from './awsClient';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isAttributeItemObject = (value: unknown): value is { Item: any } => {
    return typeof value === 'object' && value !== null && 'Item' in value;
};

const DYNAMO_DB_URL = process.env.DYNAMODB_ENDPOINT || `https://dynamodb.${process.env.AWS_REGION}.amazonaws.com`;
const DYNAMO_DB_TABLE = process.env.DYNAMODB_TABLE_NAME || 'clap';
export async function getDynamoDBItem<T>(key: string): Promise<T | undefined> {
    try {
        const aws = getAwsClient();
        const response = await aws.fetch(DYNAMO_DB_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-amz-json-1.0',
                'X-Amz-Target': 'DynamoDB_20120810.GetItem',
            },
            body: JSON.stringify({
                TableName: DYNAMO_DB_TABLE,
                Key: {
                    key: { S: key },
                },
            }),
        });
        const data = await response.json();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return isAttributeItemObject(data) ? unmarshall(data.Item).value : undefined;
    } catch (e) {
        console.error(e);
        return undefined;
    }
}

async function deleteDynamoDBItem(key: string): Promise<void> {
    try {
        const aws = getAwsClient();
        await aws.fetch(DYNAMO_DB_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-amz-json-1.0',
                'X-Amz-Target': 'DynamoDB_20120810.DeleteItem',
            },
            body: JSON.stringify({
                TableName: DYNAMO_DB_TABLE,
                Key: {
                    key: { S: key },
                },
            }),
        });
    } catch (e) {
        console.error(e);
    }
}

async function updateDynamoDBItem<T>(key: string, value: T): Promise<void> {
    try {
        const aws = getAwsClient();
        await aws.fetch(DYNAMO_DB_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-amz-json-1.0',
                'X-Amz-Target': 'DynamoDB_20120810.PutItem',
            },
            body: JSON.stringify({
                TableName: DYNAMO_DB_TABLE,
                Item: marshall({
                    key: key,
                    value: value,
                }),
            }),
        });
    } catch (e) {
        console.error(e);
    }
}

export async function setDynamoDBItem<T>(key: string, value: T | undefined): Promise<void> {
    if (value === undefined) {
        await deleteDynamoDBItem(key);
    } else {
        await updateDynamoDBItem(key, value);
    }
}
