import type { Request, Response, NextFunction } from 'express';
import MLT from 'mlt';
import nodeHtmlToImage from 'node-html-to-image';
import path from 'path';
import { getRepository, getManager } from 'typeorm';

import { Image } from '../entities/image';
import { PDFDownload } from '../entities/pdfDownload';
import { Plan } from '../entities/plan';
import { Project } from '../entities/project';
import { Question } from '../entities/question';
import { Scenario } from '../entities/scenario';
import { Sound } from '../entities/sound';
import { Theme } from '../entities/theme';
import { UserType } from '../entities/user';
import { deleteImage } from '../fileUpload';
import { AppError, ErrorCode } from '../middlewares/handleErrors';
import { htmlToPDF, PDF } from '../pdf';
import { logger } from '../utils/logger';
import { Controller, post, put, get, del } from './controller';

type planFromBody = { id?: number | string; url?: string; description?: string };
type QuestionFromBody = { question?: string; id?: number | string; plans?: Array<planFromBody> };
type QuestionsFromBody = Array<QuestionFromBody>;

function getQuestionsFromBody(req: Request): Question[] {
    const questions: Question[] = [];
    for (const q of (req.body.questions || []) as QuestionsFromBody) {
        const question = new Question();
        question.question = q.question || '';
        question.plans = [];
        for (const p of q.plans || []) {
            const plan = new Plan();
            plan.url = p.url || '';
            plan.description = p.description || '';
            question.plans.push(plan);
        }
        questions.push(question);
    }
    return questions;
}

export class ProjectController extends Controller {
    constructor() {
        super('projects');
    }

    @post({ path: '/pdf' })
    public async getProjectPDF(req: Request, res: Response): Promise<void> {
        const languageCode: string = req.body.languageCode || 'fr';
        let theme: Theme | undefined = await getRepository(Theme).findOne(parseInt(req.body.themeId, 10) || 0);
        const project: Project | undefined = await getRepository(Project).findOne(req.body.projectId || 0);
        let scenario: Scenario | undefined = await getRepository(Scenario).findOne({
            where: {
                id: req.body.scenarioId || 0,
                languageCode,
            },
        });
        if (theme === undefined) {
            if (req.body.themeName !== undefined) {
                theme = new Theme();
                theme.names = {
                    fr: req.body.themeName,
                };
            } else {
                throw new AppError('Invalid data', ErrorCode.INVALID_DATA);
            }
        }
        if (scenario === undefined) {
            if (req.body.scenarioName !== undefined && req.body.scenarioDescription !== undefined) {
                scenario = new Scenario();
                scenario.name = req.body.scenarioName;
                scenario.description = req.body.scenarioDescription;
            } else {
                throw new AppError('Invalid data', ErrorCode.INVALID_DATA);
            }
        }

        const questions: Question[] = getQuestionsFromBody(req);

        const url = await htmlToPDF(
            PDF.PLAN_DE_TOURNAGE,
            {
                themeName: theme.names[req.body.languageCode || 'fr'] || theme.names.fr,
                scenarioName: scenario.name,
                scenarioDescription: scenario.description,
                pseudo: req.user !== undefined ? req.user.pseudo : undefined,
                questions,
                projectId: project !== undefined ? project.id : null,
                projectTitle: project !== undefined ? project.title : null,
            },
            req.body.languageCode || undefined,
        );
        //For PDF Download statistics
        const pdfEntry = new PDFDownload();
        await getRepository(PDFDownload).save(pdfEntry);
        res.sendJSON({ url });
    }

    @post({ path: '/mlt' })
    public async getProjectMLT(req: Request, res: Response): Promise<void> {
        const project: Project | undefined = await getRepository(Project)
            .createQueryBuilder('project')
            .where('project.id = :id', { id: req.body.projectId })
            .leftJoinAndSelect('project.questions', 'question')
            .leftJoinAndSelect('question.plans', 'plans')
            .leftJoinAndSelect('question.title', 'title')
            .leftJoinAndSelect('question.sound', 'questionSound')
            .leftJoinAndSelect('project.sound', 'sound')
            .getOne();
        if (project == null) {
            throw new AppError('Invalid data', ErrorCode.INVALID_DATA);
        }

        console.log(project);

        const mlt = new MLT();
        const multitrack = new MLT.Multitrack();
        const tractor = new MLT.Tractor();
        const voicesOff = new MLT.Playlist();
        let totalLength = 0;
        totalLength++;

        project.questions.map(async (q) => {
            let duration = 0;

            if (q.title != null) {
                duration += q.title.duration;
                const style =
                    q.title.style === ''
                        ? {
                              fontFamily: 'serif',
                              top: '10',
                              left: '35',
                          }
                        : JSON.parse(q.title.style);
                const html = `<html>
                    <head>
                    <style>
                        body {
                            width: 2480px;
                            height: 3508px;
                            font-family: ${style.fontFamily}
                        }
                    </style>
                    </head>
                    <body>
                        <h1 style="position: absolute; top: ${style.top}%; left: ${style.left}%;">${q.title.text}</h1>
                    </body>
                </html>`;
                await nodeHtmlToImage({
                    output: path.join(__dirname, '../static/images/', 'title.png'),
                    html,
                });
                console.log(path.join(__dirname, '../static/images/', 'title.png'));
            }
            q.plans.map((p) => {
                const producer = new MLT.Producer.Image({ source: p.url });
                const playlist = new MLT.Playlist();
                playlist.entry({
                    producer: producer,
                    length: p.duration,
                });
                duration += p.duration;
                mlt.push(playlist);
                multitrack.addTrack(new MLT.Multitrack.Track(playlist));
            });
            if (q.sound != null) {
                const voiceOff = new MLT.Producer.Audio({ source: q.sound.path });
                mlt.push(voiceOff);
                voicesOff.entry({
                    producer: voiceOff,
                    length: duration,
                });
            } else {
                voicesOff.blank(duration);
            }
        });
        mlt.push(voicesOff);
        multitrack.addTrack(new MLT.Multitrack.Track(voicesOff));

        if (project.sound != null) {
            const bgMusic = new MLT.Producer.Audio({ source: project.sound });
            mlt.push(bgMusic);
            const music = new MLT.Playlist().entry({
                producer: bgMusic,
                length: totalLength,
            });
            mlt.push(music);
            multitrack.addTrack(new MLT.Multitrack.Track(music));
        }

        mlt.push(tractor.push(multitrack));
        console.log(mlt.toString());

        res.sendJSON({ mlt });
    }

    @get({ userType: UserType.CLASS })
    public async getProjects(req: Request, res: Response): Promise<void> {
        if (req.user === undefined) {
            res.sendJSON([]);
            return;
        }

        const projects = await getRepository(Project).find({ where: { user: { id: req.user.id } }, relations: ['theme'] });
        res.sendJSON(projects);
    }

    @get({ path: '/:id', userType: UserType.CLASS })
    public async getProject(req: Request, res: Response, next: NextFunction): Promise<void> {
        if (req.user === undefined) {
            next();
            return;
        }

        const id = parseInt(req.params.id || '', 10) || 0;
        const project: Project | undefined = await getRepository(Project).findOne(
            { id, user: { id: req.user.id } },
            { relations: ['theme', 'scenario', 'questions'] },
        );
        if (project === undefined) {
            next();
            return;
        }

        project.questions = project.questions.sort((q1, q2) => q1.index - q2.index || q1.id - q2.id);
        const getQuestionWithPlansPromises: Array<Promise<Question>> = [];
        for (const question of project.questions) {
            getQuestionWithPlansPromises.push(question.getPlans());
        }
        project.questions = await Promise.all(getQuestionWithPlansPromises);

        res.sendJSON(project);
    }

    @post({ userType: UserType.CLASS })
    public async addProject(req: Request, res: Response, next: NextFunction): Promise<void> {
        if (req.user === undefined) {
            next();
            return;
        }

        const project = new Project();

        // set theme and scenario
        if (req.body.scenario !== undefined) {
            project.scenario = req.body.scenario;
        }
        if (req.body.theme !== undefined) {
            project.theme = req.body.theme;
        }
        if (project.scenario === undefined || project.theme === undefined) {
            next();
            return;
        }
        if (req.body.title !== undefined) {
            project.title = req.body.title;
        }
        if (req.body.musicBeginTime !== undefined) {
            project.musicBeginTime = req.body.musicBeginTime;
        }

        // get questions
        project.questions = getQuestionsFromBody(req);
        project.user = req.user;

        // save all in a transaction in case of one problem
        await getManager().transaction(async (entityManager) => {
            await entityManager.getRepository(Project).save(project);
            const questionSavePromises: Array<Promise<Question>> = [];
            for (const [index, q] of project.questions.entries()) {
                q.plans = []; // we do not save plans yet
                q.scenarioId = project.scenario.id;
                q.languageCode = project.scenario.languageCode;
                q.index = index;
                q.project = new Project();
                q.project.id = project.id;
                questionSavePromises.push(entityManager.getRepository(Question).save(q));
            }
            project.questions = await Promise.all(questionSavePromises);
        });

        // return saved project with ids
        res.sendJSON(project);
    }

    @put({ path: '/:id', userType: UserType.CLASS })
    public async editProject(req: Request, res: Response, next: NextFunction): Promise<void> {
        if (req.user === undefined) {
            next();
            return;
        }

        const id = parseInt(req.params.id || '', 10) || 0;
        const project: Project | undefined = await getRepository(Project).findOne({ id, user: { id: req.user.id } });
        if (project === undefined) {
            next();
            return;
        }

        if (req.body.musicBeginTime !== undefined) {
            project.musicBeginTime = req.body.musicBeginTime;
        }
        if (req.body.soundId !== undefined) {
            project.sound = new Sound();
            project.sound.id = req.body.soundId;
        }

        if (req.body.title !== undefined) {
            project.title = req.body.title;
            if (project.title.length === 0) {
                throw new AppError('Title should not be empty', ErrorCode.INVALID_DATA);
            }
            await getRepository(Project).save(project);
        }
        res.sendJSON(project);
    }

    @del({ path: '/:id', userType: UserType.CLASS })
    public async deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
        if (req.user === undefined) {
            next();
            return;
        }
        const id = parseInt(req.params.id || '', 10) || 0;

        // Delete all plan images
        const project = await getRepository(Project).findOne({ id, user: { id: req.user.id } }, { relations: ['theme', 'scenario', 'questions'] });
        if (project !== undefined) {
            const getQuestionWithPlansPromises: Array<Promise<Question>> = [];
            for (const question of project.questions) {
                getQuestionWithPlansPromises.push(question.getPlans());
            }
            project.questions = await Promise.all(getQuestionWithPlansPromises);
            const deleteImagePromises: Array<Promise<void>> = [];
            project.questions.forEach((question) => {
                question.plans.forEach((plan) => {
                    if (plan.image !== null) {
                        const image = plan.image;
                        deleteImagePromises.push(
                            (async () => {
                                await deleteImage(image);
                                await getRepository(Image).delete({ id: image.id });
                            })(),
                        );
                    }
                });
            });
            try {
                await Promise.all(deleteImagePromises);
            } catch (e) {
                logger.error(e);
            }
        }

        await getRepository(Project).delete({ id, user: { id: req.user.id } });
        res.status(204).send();
    }
}
