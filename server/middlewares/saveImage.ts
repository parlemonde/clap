import type { NextFunction, Request, RequestHandler, Response } from 'express';
import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';
import { getRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { Image } from '../entities/image';
import { deleteImage, uploadImage } from '../fileUpload';

export type Ratio = {
    width: number | null;
    height: number | null;
};

export function saveImage(tableName: string, ratio: Ratio = { width: 420, height: 308 }): RequestHandler {
    return async (req: Request, _: Response, next: NextFunction): Promise<void> => {
        if (!req.file?.buffer) {
            next();
            return;
        }

        // First save image on disk to resize it.
        const dir = path.join(__dirname, '../static/images/', tableName);
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
        const filePath: string | null = await uploadImage(uuid, path.join('static/images', tableName));
        if (filePath !== null) {
            // Next save it in the database
            const image = new Image();
            image.path = filePath;
            image.uuid = uuid;
            image.localPath = path.join('images', tableName);
            try {
                await getRepository(Image).save(image);
                req.imageID = image.id;
                req.image = image;
            } catch (e) {
                // error, remove files
                await deleteImage(image);
            }
        }
        next();
    };
}
