import type { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';

import { Question } from '../entities/question';
import { Title } from '../entities/title';
import { UserType } from '../entities/user';
import { Controller, del, get, post, put } from './controller';

export class TitleController extends Controller {
    constructor() {
        super('titles');
    }

    @get({ path: '/:questionId' })
    public async getTitle(req: Request, res: Response, next: NextFunction): Promise<void> {
        const id: number = parseInt(req.params.questionId, 10) || 0;
        const title: Title | undefined = await getRepository(Title).findOne(id, { relations: ['question'] });
        if (title === undefined) {
            next(); // will send 404 error
            return;
        }
        res.sendJSON(title);
    }

    @post({ userType: UserType.CLASS })
    public async addTheme(req: Request, res: Response): Promise<void> {
        const title: Title = new Title(); // create a new title
        title.duration = 0;
        title.style = '';
        title.text = '';

        if (req.body.text !== undefined) {
            title.text = req.body.text;
        }
        if (req.body.style !== undefined) {
            title.style = req.body.style;
        }
        if (req.body.duration !== undefined) {
            title.duration = req.body.duration;
        }
        if (req.body.questionId !== undefined) {
            title.question = new Question();
            title.question.id = req.body.questionId;
        }

        await getRepository(Title).save(title); // save new title
        res.sendJSON(title); // send new title
    }

    @put({ path: '/:id', userType: UserType.CLASS })
    public async editTitle(req: Request, res: Response, next: NextFunction): Promise<void> {
        const id: number = parseInt(req.params.id, 10) || 0;
        const title: Title | undefined = await getRepository(Title).findOne(id);
        if (title === undefined) {
            next();
            return;
        }
        if (req.body.text !== undefined) {
            title.text = req.body.text;
        }
        if (req.body.style !== undefined) {
            title.style = req.body.style;
        }
        if (req.body.duration !== undefined) {
            title.duration = req.body.duration;
        }

        await getRepository(Title).save(title);
        res.sendJSON(title); // send updated title
    }

    @del({ path: '/:id', userType: UserType.PLMO_ADMIN })
    public async deleteTitle(req: Request, res: Response): Promise<void> {
        const id: number = parseInt(req.params.id, 10) || 0;

        await getRepository(Title).delete({ id });
        res.status(204).send();
    }
}
