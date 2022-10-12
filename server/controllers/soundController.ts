import type { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';

import { Sound } from '../entities/sound';
import { UserType } from '../entities/user';
import { Controller, del, put } from './controller';

export class SoundController extends Controller {
    constructor() {
        super('sounds');
    }

    @put({ path: '/:id', userType: UserType.CLASS })
    public async editSound(req: Request, res: Response, next: NextFunction): Promise<void> {
        const id: number = parseInt(req.params.id, 10) || 0;
        const sound: Sound | undefined = await getRepository(Sound).findOne(id);
        if (sound === undefined) {
            next();
            return;
        }
        if (req.body.volume !== undefined) {
            sound.volume = req.body.volume;
        }

        await getRepository(Sound).save(sound);
        res.sendJSON(sound); // send updated sound
    }

    @del({ path: '/:id', userType: UserType.PLMO_ADMIN })
    public async deleteSound(req: Request, res: Response): Promise<void> {
        const id: number = parseInt(req.params.id, 10) || 0;

        await getRepository(Sound).delete({ id });
        res.status(204).send();
    }
}
