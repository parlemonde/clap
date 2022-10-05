import type { NextFunction, Request, RequestHandler, Response } from 'express';
import fs from 'fs-extra';
import path from 'path';
import { getRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { Sound } from '../entities/sound';
import { uploadFile } from '../fileUpload';

export type Ratio = {
    width: number | null;
    height: number | null;
};

export function saveSound(tableName: string): RequestHandler {
    return async (req: Request, _: Response, next: NextFunction): Promise<void> => {
        if (!req.file?.buffer) {
            next();
            return;
        }

        // First save sound on disk to resize it.
        const dir = path.join(__dirname, '../static/audio/', tableName);
        await fs.ensureDir(dir).catch();
        const uuid = uuidv4();

        // then send file to server
        const filePath: string | null = await uploadFile(uuid, path.join('static/audio', tableName));
        if (filePath !== null) {
            // Next save it in the database
            const sound = new Sound();
            sound.path = filePath;
            sound.uuid = uuid;
            sound.volume = 100;
            sound.localPath = path.join('audio', tableName);
            try {
                await getRepository(Sound).save(sound);
                req.soundID = sound.id;
                req.sound = sound;
            } catch (e) {
                //return e;
            }
        }
        next();
    };
}
