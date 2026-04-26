'use server';

import { getEnvVariable } from '@server/get-env-variable';

import { getAwsClient } from './awsClient';

interface InvokeVideoLambda {
    kind: 'video';
    payload: {
        mlt: string;
        s3Files: { name: string; path: string }[];
        httpFiles: { name: string; path: string }[];
        s3BucketName: string;
        s3Key: string;
    };
}

type InvokeLambda = InvokeVideoLambda; // Add other options here

const getLambdaFunctionName = (kind: InvokeLambda['kind']): string | undefined => {
    if (kind === 'video') {
        return getEnvVariable('AWS_LAMBDA_VIDEO_FUNCTION_NAME');
    }
    return undefined;
};

export async function invokeLambda(lambda: InvokeLambda, isAsync = false): Promise<unknown> {
    const lambdaFunction = getLambdaFunctionName(lambda.kind);
    if (!lambdaFunction) {
        throw new Error(`Lambda function ${lambda.kind} not found`);
    }
    const awsRegion = getEnvVariable('AWS_REGION');
    if (!awsRegion) {
        throw new Error('AWS_REGION is not set');
    }
    const client = getAwsClient();
    const lambdaUrl = `https://lambda.${awsRegion}.amazonaws.com/2015-03-31/functions/${lambdaFunction}/invocations`;
    const res = await client.fetch(lambdaUrl, {
        headers: isAsync
            ? {
                  'X-Amz-Invocation-Type': 'Event',
              }
            : undefined,
        body: JSON.stringify(lambda.payload),
    });
    return isAsync ? {} : res.json();
}
