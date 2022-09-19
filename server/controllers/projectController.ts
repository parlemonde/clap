import type { Request, Response, NextFunction } from 'express';
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
