'use server';

import { getAwsClient } from './awsClient';

interface InvokePDFLambda {
    kind: 'pdf';
    payload: {
        html: string;
        s3BucketName: string;
        s3Key: string;
    };
}

type InvokeLambda = InvokePDFLambda; // Add other options here
const lambdaFunctions: Record<InvokeLambda['kind'], string | undefined> = {
    pdf: process.env.AWS_LAMBDA_PDF_FUNCTION_NAME,
};

export async function invokeLambda(lambda: InvokeLambda): Promise<unknown> {
    const lambdaFunction = lambdaFunctions[lambda.kind];
    if (!lambdaFunction) {
        throw new Error(`Lambda function ${lambda.kind} not found`);
    }
    if (!process.env.AWS_REGION) {
        throw new Error('AWS_REGION is not set');
    }
    const client = getAwsClient();
    const lambdaUrl = `https://lambda.${process.env.AWS_REGION}.amazonaws.com/2015-03-31/functions/${lambdaFunction}/invocations`;
    const res = await client.fetch(lambdaUrl, { body: JSON.stringify(lambda.payload) });
    return res.json();
}
