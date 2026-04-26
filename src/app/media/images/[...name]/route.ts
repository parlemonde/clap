import mime from 'mime-types';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import sanitize from 'sanitize-filename';
import sharp from 'sharp';
import { Readable } from 'stream';

import { getCurrentUser } from '@server/auth/get-current-user';
import { getFile, getFileData } from '@server/file-upload/file-upload';
import {
    getSignedMediaCacheControl,
    NO_STORE_MEDIA_CACHE_CONTROL,
    PRIVATE_USER_MEDIA_CACHE_CONTROL,
    PUBLIC_IMMUTABLE_MEDIA_CACHE_CONTROL,
} from '@server/file-upload/get-cache-control';
import { isSignedImageUrlValid } from '@server/file-upload/get-signed-image-url';
import { getByteRangeLength, parseRangeHeader, type ByteRange } from '@server/file-upload/range-request';

const notFoundResponse = () => {
    return new NextResponse('Error 404, not found.', {
        headers: {
            'Cache-Control': NO_STORE_MEDIA_CACHE_CONTROL,
        },
        status: 404,
    });
};
const getContentTypeFromFileName = (filename: string): string | null => mime.lookup(filename) || null;

async function getImageCacheControl(request: NextRequest, name: string[]): Promise<string | null> {
    const isUserImage = name.length >= 2 && name[0] === 'users';
    if (!isUserImage) {
        return PUBLIC_IMMUTABLE_MEDIA_CACHE_CONTROL;
    }

    const isSignedUrl = await isSignedImageUrlValid(request.url);
    if (isSignedUrl) {
        return getSignedMediaCacheControl(request.nextUrl.searchParams.get('expires'));
    }

    const currentUser = await getCurrentUser();
    const userImageId = currentUser?.role === 'student' ? currentUser.teacherId : currentUser?.id;
    if (name[1] !== `${userImageId}`) {
        return null;
    }

    return PRIVATE_USER_MEDIA_CACHE_CONTROL;
}

const getSuccessHeaders = (contentLength: number, lastModified: Date, contentType: string, cacheControl: string, range?: ByteRange) => {
    const headers = new Headers({
        'Accept-Ranges': 'bytes',
        'Cache-Control': cacheControl,
        'Content-Length': `${range ? getByteRangeLength(range) : contentLength}`,
        'Content-Type': contentType,
        'Last-Modified': lastModified.toISOString(),
    });

    if (range) {
        headers.set('Content-Range', `bytes ${range.start}-${range.end}/${contentLength}`);
    }

    return headers;
};

const rangeNotSatisfiableResponse = (contentLength: number, lastModified: Date, contentType: string, cacheControl: string) => {
    const headers = getSuccessHeaders(contentLength, lastModified, contentType, cacheControl);
    headers.set('Content-Length', '0');
    headers.set('Content-Range', `bytes */${contentLength}`);

    return new Response(null, {
        headers,
        status: 416,
    });
};

const getBufferRangeResponse = (buffer: Buffer, lastModified: Date, contentType: string, cacheControl: string, byteRange?: ByteRange) => {
    const body = byteRange ? buffer.subarray(byteRange.start, byteRange.end + 1) : buffer;

    return new Response(body as unknown as BodyInit, {
        headers: getSuccessHeaders(buffer.byteLength, lastModified, contentType, cacheControl, byteRange),
        status: byteRange ? 206 : 200,
    });
};

export async function GET(request: NextRequest, props: { params: Promise<{ name: string[] }> }) {
    const params = await props.params;
    const cacheControl = await getImageCacheControl(request, params.name);
    if (!cacheControl) {
        return notFoundResponse();
    }

    const fileName = `media/images/${params.name.map((path) => sanitize(path)).join('/')}`;
    const data = await getFileData(fileName);

    if (!data || data.ContentLength === 0) {
        return notFoundResponse();
    }

    const size = data.ContentLength;
    const range = request.headers.get('range');
    const contentType =
        data.ContentType.length === 0 || data.ContentType === 'application/octet-stream'
            ? (getContentTypeFromFileName(fileName) ?? 'application/octet-stream')
            : (data.ContentType ?? 'application/octet-stream');
    const width = Number(request.nextUrl.searchParams.get('w'));
    const quality = Number(request.nextUrl.searchParams.get('q'));

    if (width) {
        const readable = (await getFile(fileName))?.on('error', () => {
            return notFoundResponse();
        });
        if (!readable) {
            return notFoundResponse();
        }

        const resizedImage = await getResizedImageBuffer(readable, width, quality || 75, contentType.slice(6));
        const rangeRequest = parseRangeHeader(range, resizedImage.byteLength);
        if (rangeRequest?.status === 'unsatisfiable') {
            return rangeNotSatisfiableResponse(resizedImage.byteLength, data.LastModified, contentType, cacheControl);
        }

        const byteRange = rangeRequest?.status === 'range' ? rangeRequest.range : undefined;
        return getBufferRangeResponse(resizedImage, data.LastModified, contentType, cacheControl, byteRange);
    }

    const rangeRequest = parseRangeHeader(range, size);
    if (rangeRequest?.status === 'unsatisfiable') {
        return rangeNotSatisfiableResponse(size, data.LastModified, contentType, cacheControl);
    }

    const byteRange = rangeRequest?.status === 'range' ? rangeRequest.range : undefined;
    const readable = (await getFile(fileName, byteRange))?.on('error', () => {
        return notFoundResponse();
    });
    if (!readable) {
        return notFoundResponse();
    }

    return new Response(Readable.toWeb(readable) as ReadableStream, {
        headers: getSuccessHeaders(size, data.LastModified, contentType, cacheControl, byteRange),
        status: byteRange ? 206 : 200,
    });
}

export async function HEAD(request: NextRequest, props: { params: Promise<{ name: string[] }> }) {
    const params = await props.params;
    const cacheControl = await getImageCacheControl(request, params.name);
    if (!cacheControl) {
        return notFoundResponse();
    }

    const fileName = `media/images/${params.name.map((path) => sanitize(path)).join('/')}`;
    const data = await getFileData(fileName);
    if (!data || data.ContentLength === 0) {
        return notFoundResponse();
    }

    const contentType =
        data.ContentType.length === 0 || data.ContentType === 'application/octet-stream'
            ? (getContentTypeFromFileName(fileName) ?? 'application/octet-stream')
            : (data.ContentType ?? 'application/octet-stream');
    const width = Number(request.nextUrl.searchParams.get('w'));
    const quality = Number(request.nextUrl.searchParams.get('q'));

    const response = new NextResponse(null, {
        headers: {
            'Accept-Ranges': 'bytes',
            'Cache-Control': cacheControl,
            'Content-Type': contentType,
            'Last-Modified': data.LastModified.toISOString(),
        },
        status: 200,
    });
    if (width) {
        const readable = (await getFile(fileName))?.on('error', () => {
            return notFoundResponse();
        });
        if (!readable) {
            return notFoundResponse();
        }
        const resizedImage = await getResizedImageBuffer(readable, width, quality || 75, contentType.slice(6));
        response.headers.set('Content-Length', `${resizedImage.byteLength}`);
    } else {
        response.headers.set('Content-Length', `${data.ContentLength}`);
    }
    return response;
}

async function getResizedImageBuffer(image: Readable, width: number, quality?: number, format?: string): Promise<Buffer> {
    const pipeline = sharp();
    pipeline.resize(width);
    if (quality && (format === 'jpeg' || format === 'jpg')) {
        pipeline.jpeg({ quality: Math.max(Math.min(quality, 100), 1) });
    } else if (quality && format === 'webp') {
        pipeline.webp({ quality: Math.max(Math.min(quality, 100), 1) });
    } else if (quality && format === 'avif') {
        pipeline.avif({ quality: Math.max(Math.min(quality, 100), 1) });
    } else if (quality && format === 'png') {
        pipeline.png({ quality: Math.max(Math.min(quality, 100), 1) });
    }
    image.pipe(pipeline);
    return pipeline.toBuffer();
}
