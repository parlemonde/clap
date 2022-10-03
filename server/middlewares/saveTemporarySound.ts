import type { NextFunction, Request, RequestHandler, Response } from 'express';
import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

import { Sound } from '../entities/sound';
import { uploadSound } from '../fileUpload';

export function saveTemporarySound(tableName: string): RequestHandler {
    return async (req: Request, _: Response, next: NextFunction): Promise<void> => {
        if (!req.file?.buffer) {
            next();
            return;
        }

        // First save image on disk to resize it.
        const dir = path.join(__dirname, '../static/temp-sounds/', tableName);
        await fs.ensureDir(dir).catch();
        const uuid = uuidv4();
        fs.createWriteStream(path.join(dir, `${uuid}.mp3`)).write(req?.file.buffer);

        // then send file to server
        const filePath: string | null = await uploadSound(uuid, path.join('static/temp-sounds', tableName));
        if (filePath !== null) {
            const sound = new Sound();
            sound.path = filePath;
            sound.uuid = uuid;
            sound.localPath = path.join('temp-sounds', tableName);
            sound.volume = 100;
            req.sound = sound;
            req.soundID = 0;
        }
        next();
    };
}
