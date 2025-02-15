import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import type { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const DYNAMODB_CONFIG: DynamoDBClientConfig = {
    credentials: {
        accessKeyId: process.env.DYNAMODB_ACCESS_KEY || process.env.S3_ACCESS_KEY || 'local',
        secretAccessKey: process.env.DYNAMODB_SECRET_KEY || process.env.S3_SECRET_KEY || 'local',
    },
    region: process.env.DYNAMODB_REGION || 'local',
    endpoint: process.env.DYNAMODB_ENDPOINT,
};
const DYNAMODB_CLIENT = new DynamoDBClient(DYNAMODB_CONFIG);
const DYNAMODB_DOCUMENT_CLIENT = DynamoDBDocumentClient.from(DYNAMODB_CLIENT, {
    marshallOptions: {
        removeUndefinedValues: true,
    },
});
const TableName = process.env.DYNAMODB_TABLE_NAME;

export async function getDynamoDbValue<T extends Record<string, unknown>>(key: string): Promise<T | undefined> {
    if (!TableName) {
        console.warn('DynamoDB table name not set. Cannot get value');
        return undefined;
    }

    const command = new GetCommand({
        TableName,
        Key: {
            key,
        },
    });
    const result = await DYNAMODB_DOCUMENT_CLIENT.send(command);
    return result.Item?.value;
}

export async function setDynamoDbValue<T>(key: string, value: T): Promise<void> {
    if (!TableName) {
        console.warn('DynamoDB table name not set. Cannot set value');
        return undefined;
    }
    if (value === undefined) {
        const command = new DeleteCommand({
            TableName,
            Key: {
                key,
            },
        });
        await DYNAMODB_DOCUMENT_CLIENT.send(command);
    } else {
        const command = new PutCommand({
            TableName,
            Item: {
                key,
                value,
            },
        });
        await DYNAMODB_DOCUMENT_CLIENT.send(command);
    }
}
