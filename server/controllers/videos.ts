import type { ReadableStream } from 'node:stream/web';
import { Readable } from 'stream';

import { logger } from '../lib/logger';
import { Controller } from './controller';

const videoController = new Controller('/videos');

const BUILD_SERVER_URL = process.env.BUILD_SERVER_URL;
const HEADERS = ['Accept-Ranges', 'Content-Range', 'Content-Length', 'Last-Modified', 'Content-Type'];

videoController.get({ path: '/:id/:filename' }, async (req, res, next) => {
    if (!BUILD_SERVER_URL) {
        next();
        return;
    }

    const headers: HeadersInit = {};
    if (req.headers.range) {
        headers.range = req.headers.range;
    }
    try {
        const response = await fetch(`${BUILD_SERVER_URL}/api/v1/melt/${req.params.id}/${req.params.filename}`, {
            method: req.method,
            headers,
        });

        if (!response.body) {
            next();
            return;
        }
        const readable = Readable.fromWeb(response.body as ReadableStream);
        readable.on('error', () => {
            next();
        });
        for (const header of HEADERS) {
            const value = response.headers.get(header);
            if (value) {
                res.setHeader(header, value);
            }
        }
        res.status(response.status);
        readable.pipe(res);
    } catch (err) {
        logger.error(err);
        next();
    }
});

export { videoController };
