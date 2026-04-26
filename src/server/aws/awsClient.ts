import { AwsClient } from 'aws4fetch';

import { getEnvVariable } from '@server/get-env-variable';
import { registerService } from '@server/register-service';

let awsClient: AwsClient | undefined;
export function getAwsClient(): AwsClient {
    if (!awsClient) {
        awsClient = registerService(
            'aws-client',
            () =>
                new AwsClient({
                    accessKeyId: getEnvVariable('AWS_ACCESS_KEY_ID'),
                    secretAccessKey: getEnvVariable('AWS_SECRET_ACCESS_KEY'),
                    sessionToken: getEnvVariable('AWS_SESSION_TOKEN') || undefined,
                    region: getEnvVariable('AWS_REGION'),
                }),
        );
    }
    return awsClient;
}
