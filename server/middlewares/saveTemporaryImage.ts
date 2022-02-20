import type { NextFunction, Request, RequestHandler, Response } from 'express';
import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

import { Image } from '../entities/image';
import { uploadImage } from '../fileUpload';
import type { Ratio } from './saveImage';

export function saveTemporaryImage(tableName: string, ratio: Ratio = { width: null, height: 500 }): RequestHandler {
    return async (req: Request, _: Response, next: NextFunction): Promise<void> => {
        if (!req.file?.buffer) {
            next();
            return;
        }

        // First save image on disk to resize it.
        const dir = path.join(__dirname, '../static/temp-images/', tableName);
        await fs.ensureDir(dir).catch();
        const uuid = uuidv4();
        await sharp(req.file.buffer)
            .resize(ratio.width, ratio.height)
            .flatten({
                background: {
                    r: 255,
                    g: 255,
                    b: 255,
                },
            })
            .toFormat('jpeg')
            .toFile(path.join(dir, `${uuid}.jpeg`));

        // then send file to server
        const filePath: string | null = await uploadImage(uuid, path.join('static/temp-images', tableName));
        if (filePath !== null) {
            const image = new Image();
            image.path = filePath;
            image.uuid = uuid;
            image.localPath = path.join('temp-images', tableName);
            req.image = image;
            req.imageID = 0;
        }
        next();
    };
}
