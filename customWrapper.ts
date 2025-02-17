import type { WarmerEvent, WarmerResponse } from '@opennextjs/aws/adapters/warmer-function.js';
import type { StreamCreator } from '@opennextjs/aws/types/open-next.js';
import type { WrapperHandler } from '@opennextjs/aws/types/overrides.js';
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { Writable } from 'node:stream';

type AwsLambdaEvent = APIGatewayProxyEventV2 | WarmerEvent;

type AwsLambdaReturn = APIGatewayProxyResultV2 | WarmerResponse;

const serverId = Math.random().toPrecision(5).toString();

function formatWarmerResponse(event: WarmerEvent) {
    return new Promise<WarmerResponse>((resolve) => {
        setTimeout(() => {
            resolve({ serverId, type: 'warmer' } satisfies WarmerResponse);
        }, event.delay);
    });
}

const handler: WrapperHandler =
    async (handler, converter) =>
    async (event: AwsLambdaEvent): Promise<AwsLambdaReturn> => {
        // Handle warmer event
        if ('type' in event) {
            return formatWarmerResponse(event);
        }

        const internalEvent = await converter.convertFrom(event);
        delete internalEvent.headers['if-none-match']; // Remove If-None-Match header from request. Can't be used with nonce script hash.

        //This is a workaround, there is an issue in node that causes node to crash silently if the OpenNextNodeResponse stream is not consumed
        //This does not happen everytime, it's probably caused by suspended component in ssr (either via <Suspense> or loading.tsx)
        //Everyone that wish to create their own wrapper without a StreamCreator should implement this workaround
        //This is not necessary if the underlying handler does not use OpenNextNodeResponse (At the moment, OpenNextNodeResponse is used by the node runtime servers and the image server)
        const fakeStream: StreamCreator = {
            writeHeaders: () => {
                return new Writable({
                    write: (_chunk, _encoding, callback) => {
                        callback();
                    },
                });
            },
        };

        const response = await handler(internalEvent, fakeStream);
        delete response.headers['etag']; // Remove ETag header from response. Can't be used with nonce script hash.
        return await converter.convertTo(response, event);
    };

const customWrapper = {
    wrapper: handler,
    name: 'custom-aws-lambda',
    supportStreaming: false,
};

export default customWrapper;
