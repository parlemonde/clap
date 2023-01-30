import type { NextFunction, Request, Response } from 'express';

import { streamFile } from '../fileUpload/streamFile';
import { Controller, get } from './controller';

export class ImageController extends Controller {
    constructor() {
        super('images');
    }

    @get({ path: '/:filename' })
    public async getImage(req: Request, res: Response, next: NextFunction): Promise<void> {
        const key = `images/${req.params.filename}`;
        streamFile(key, req, res, next);
        res.sendJSON({});
    }
}
