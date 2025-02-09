import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import sanitize from 'sanitize-filename';

import { getCurrentUser } from 'src/actions/get-current-user';

const notFoundResponse = () => {
    return new NextResponse('Error 404, not found.', {
        status: 404,
    });
};

const BUILD_SERVER_URL = process.env.BUILD_SERVER_URL;
const HEADERS = ['Accept-Ranges', 'Content-Range', 'Content-Length', 'Last-Modified', 'Content-Type'];

export async function GET(request: NextRequest, props: { params: Promise<{ name: string[] }> }) {
    if (!BUILD_SERVER_URL) {
        return notFoundResponse();
    }

    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse('Unauthorized', {
            status: 401,
        });
    }

    const params = await props.params;
    if (params.name.length < 2) {
        return notFoundResponse();
    }

    const headers: HeadersInit = {};
    const range = request.headers.get('range');
    if (range) {
        headers.range = range;
    }
    try {
        const response = await fetch(`${BUILD_SERVER_URL}/api/v1/melt/${sanitize(params.name[0])}/${sanitize(params.name[1])}`, {
            headers,
        });

        if (!response.body) {
            return notFoundResponse();
        }
        const newResponse = new NextResponse(response.body);
        for (const header of HEADERS) {
            const value = response.headers.get(header);
            if (value) {
                newResponse.headers.set(header, value);
            }
        }
        return newResponse;
    } catch (err) {
        console.error(err);
        return notFoundResponse();
    }
}
