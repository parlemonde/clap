import mime from 'mime-types';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import sanitize from 'sanitize-filename';
import { Readable } from 'stream';

import { getCurrentUser } from '@server/auth/get-current-user';
import { getFile, getFileData } from '@server/file-upload/file-upload';
import {
    NO_STORE_MEDIA_CACHE_CONTROL,
    PRIVATE_USER_MEDIA_CACHE_CONTROL,
    PUBLIC_IMMUTABLE_MEDIA_CACHE_CONTROL,
} from '@server/file-upload/get-cache-control';
import { getByteRangeLength, parseRangeHeader, type ByteRange } from '@server/file-upload/range-request';

const notFoundResponse = () => {
    return new NextResponse(null, {
        headers: {
            'Cache-Control': NO_STORE_MEDIA_CACHE_CONTROL,
        },
        status: 404,
    });
};
const getContentTypeFromFileName = (filename: string): string | null => mime.lookup(filename) || null;

const isUserMediaPath = (filePath: string[]): boolean => filePath.length >= 3 && filePath[1] === 'users';

async function getMediaCacheControl(filePath: string[]): Promise<string | null> {
    if (!isUserMediaPath(filePath)) {
        return PUBLIC_IMMUTABLE_MEDIA_CACHE_CONTROL;
    }

    const currentUser = await getCurrentUser();
    const userMediaId = currentUser?.role === 'student' ? currentUser.teacherId : currentUser?.id;
    if (filePath[2] !== `${userMediaId}`) {
        return null;
    }

    return PRIVATE_USER_MEDIA_CACHE_CONTROL;
}

const getSuccessHeaders = (data: { ContentLength: number; LastModified: Date }, contentType: string, cacheControl: string, range?: ByteRange) => {
    const headers = new Headers({
        'Accept-Ranges': 'bytes',
        'Cache-Control': cacheControl,
        'Content-Length': `${range ? getByteRangeLength(range) : data.ContentLength}`,
        'Content-Type': contentType,
        'Last-Modified': data.LastModified.toISOString(),
    });

    if (range) {
        headers.set('Content-Range', `bytes ${range.start}-${range.end}/${data.ContentLength}`);
    }

    return headers;
};

const rangeNotSatisfiableResponse = (data: { ContentLength: number; LastModified: Date }, contentType: string, cacheControl: string) => {
    const headers = getSuccessHeaders(data, contentType, cacheControl);
    headers.set('Content-Length', '0');
    headers.set('Content-Range', `bytes */${data.ContentLength}`);

    return new Response(null, {
        headers,
        status: 416,
    });
};

export async function GET(request: NextRequest, props: { params: Promise<{ filepath: string[] }> }) {
    const filePath = (await props.params).filepath;
    const cacheControl = await getMediaCacheControl(filePath);
    if (!cacheControl) {
        return notFoundResponse();
    }

    const fileName = `media/${filePath.map((path) => sanitize(path)).join('/')}`;
    const data = await getFileData(fileName);
    if (!data || data.ContentLength === 0) {
        return notFoundResponse();
    }

    const contentType = data.ContentType || getContentTypeFromFileName(fileName) || 'application/octet-stream';
    const rangeRequest = parseRangeHeader(request.headers.get('range'), data.ContentLength);
    if (rangeRequest?.status === 'unsatisfiable') {
        return rangeNotSatisfiableResponse(data, contentType, cacheControl);
    }

    const range = rangeRequest?.status === 'range' ? rangeRequest.range : undefined;
    const readable = (await getFile(fileName, range))?.on('error', () => {
        return notFoundResponse();
    });
    if (!readable) {
        return notFoundResponse();
    }

    return new Response(Readable.toWeb(readable) as ReadableStream, {
        headers: getSuccessHeaders(data, contentType, cacheControl, range),
        status: range ? 206 : 200,
    });
}

export async function HEAD(_request: NextRequest, props: { params: Promise<{ filepath: string[] }> }) {
    const filePath = (await props.params).filepath;
    const cacheControl = await getMediaCacheControl(filePath);
    if (!cacheControl) {
        return notFoundResponse();
    }

    const fileName = `media/${filePath.map((path) => sanitize(path)).join('/')}`;

    const data = await getFileData(fileName);
    if (!data || data.ContentLength === 0) {
        return notFoundResponse();
    }

    const contentType = data.ContentType || getContentTypeFromFileName(fileName) || 'application/octet-stream';

    return new Response(null, {
        headers: getSuccessHeaders(data, contentType, cacheControl),
        status: 200,
    });
}
