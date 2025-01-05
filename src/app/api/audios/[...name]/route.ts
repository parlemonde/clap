import mime from 'mime-types';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Readable } from 'stream';

import { getFile, getFileData } from 'src/fileUpload';

const notFoundResponse = () => {
    return new NextResponse('Error 404, not found.', {
        status: 404,
    });
};
const getContentTypeFromFileName = (filename: string): string | null => mime.lookup(filename) || null;

export async function GET(request: NextRequest, props: { params: Promise<{ name: string[] }> }) {
    const params = await props.params;
    const filename = params.name.join('/');
    const data = await getFileData('audios', filename);

    if (!data || data.ContentLength === 0) {
        return notFoundResponse();
    }

    const size = data.ContentLength;
    const range = request.headers.get('range');
    const contentType =
        data.ContentType.length === 0 || data.ContentType === 'application/octet-stream'
            ? (getContentTypeFromFileName(filename) ?? 'application/octet-stream')
            : (data.ContentType ?? 'application/octet-stream');

    const readable = (await getFile('audios', filename, range || undefined))?.on('error', () => {
        return notFoundResponse();
    });
    if (!readable) {
        return notFoundResponse();
    }
    const headers = new Headers({
        'Last-Modified': data.LastModified.toISOString(),
        'Content-Type': contentType,
        'Cache-Control': 'public, s-maxage=604800, max-age=2678400, immutable',
    });

    /** Check for Range header */
    if (range) {
        /** Extracting Start and End value from Range Header */
        const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
        let start = parseInt(startStr, 10);
        let end = endStr ? parseInt(endStr, 10) : size - 1;

        if (!isNaN(start) && isNaN(end)) {
            end = size - 1;
        }
        if (isNaN(start) && !isNaN(end)) {
            start = size - end;
            end = size - 1;
        }

        // Handle unavailable range request
        if (start >= size || end >= size) {
            // Return the 416 Range Not Satisfiable.
            const response = new Response(null, {
                status: 416,
                headers,
            });
            response.headers.set('Content-Range', `bytes */${size}`);
            return response;
        }

        /** Sending Partial Content With HTTP Code 206 */
        const response = new Response(Readable.toWeb(readable) as ReadableStream, {
            status: 206,
            headers,
        });
        response.headers.set('Accept-Ranges', 'bytes');
        response.headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
        response.headers.set('Content-Length', `${end - start + 1}`);
        return response;
    } else {
        const response = new Response(Readable.toWeb(readable) as ReadableStream, {
            status: 200,
            headers,
        });
        response.headers.set('Content-Length', `${data.ContentLength}`);
        return response;
    }
}

export async function HEAD(request: NextRequest, props: { params: Promise<{ name: string }> }) {
    const params = await props.params;
    const data = await getFileData('audios', params.name);
    if (!data || data.ContentLength === 0) {
        return notFoundResponse();
    }

    const contentType =
        data.ContentType.length === 0 || data.ContentType === 'application/octet-stream'
            ? (getContentTypeFromFileName(params.name) ?? 'application/octet-stream')
            : (data.ContentType ?? 'application/octet-stream');

    const response = new NextResponse(null, {
        status: 200,
    });
    response.headers.set('Accept-Ranges', 'bytes');
    response.headers.set('Content-Length', `${data.ContentLength}`);
    response.headers.set('Last-Modified', data.LastModified.toISOString());
    response.headers.set('Content-Type', contentType);
    return response;
}
