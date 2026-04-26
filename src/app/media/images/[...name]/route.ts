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

    const readable = (await getFile(fileName, range || undefined))?.on('error', () => {
        return notFoundResponse();
    });
    if (!readable) {
        return notFoundResponse();
    }
    const headers = new Headers({
        'Last-Modified': data.LastModified.toISOString(),
        'Content-Type': contentType,
        'Cache-Control': cacheControl,
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
    } else if (width) {
        const resizedImage = await getResizedImageBuffer(readable, width, quality || 75, contentType.slice(6));
        const response = new Response(
            resizedImage as unknown as BodyInit, // TODO: Fix this
            {
                status: 200,
                headers,
            },
        );
        response.headers.set('Content-Length', `${resizedImage.byteLength}`);
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
        // if width, response will be resized image, so no range support
        response.headers.set('Content-Length', `${resizedImage.byteLength}`);
    } else {
        response.headers.set('Accept-Ranges', 'bytes');
        response.headers.set('Content-Length', `${data.ContentLength}`);
    }
    response.headers.set('Last-Modified', data.LastModified.toISOString());
    response.headers.set('Content-Type', contentType);
    response.headers.set('Cache-Control', cacheControl);
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
