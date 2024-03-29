import type { JSONSchemaType } from 'ajv';
import archiver from 'archiver';
import fs from 'fs-extra';
import http from 'http';
import * as path from 'path';
import sanitize from 'sanitize-filename';
import { getRepository, getConnection } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import type { Title } from '../../types/models/title.type';
import { Plan } from '../entities/plan';
import { Project } from '../entities/project';
import { Question } from '../entities/question';
import { UserType } from '../entities/user';
import { getFile } from '../fileUpload';
import { ajv, sendInvalidDataError } from '../lib/json-schema-validator';
import { logger } from '../lib/logger';
import { AppError } from '../middlewares/handle-errors';
import { htmlToPDF, PDF } from '../pdf';
import { getQueryString } from '../utils/get-query-string';
import { projectToXml, projectToMlt } from '../xml';
import { Controller } from './controller';

type QuestionsFromBody = Array<{
    question: string;
    title?: Title | null;
    voiceOff?: string | null;
    voiceOffBeginTime?: number;
    soundUrl?: string | null;
    soundVolume?: number | null;
    plans: Array<{
        description: string;
        imageUrl?: string | null;
        duration?: number | null;
    }>;
}>;

const QUESTION_FROM_BODY_SCHEMA: JSONSchemaType<QuestionsFromBody> = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            question: {
                type: 'string',
            },
            title: {
                type: 'object',
                properties: {
                    style: {
                        type: 'string',
                    },
                    text: {
                        type: 'string',
                    },
                    duration: {
                        type: 'number',
                        minimum: 0,
                    },
                },
                required: ['style', 'text', 'duration'],
                nullable: true,
            },
            voiceOff: {
                type: 'string',
                nullable: true,
            },
            voiceOffBeginTime: {
                type: 'number',
                nullable: true,
            },
            soundUrl: {
                type: 'string',
                nullable: true,
            },
            soundVolume: {
                type: 'number',
                nullable: true,
                minimum: 0,
                maximum: 200,
            },
            plans: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        description: {
                            type: 'string',
                        },
                        imageUrl: {
                            type: 'string',
                            nullable: true,
                        },
                        duration: {
                            type: 'number',
                            nullable: true,
                        },
                    },
                    required: ['description'],
                    additionalProperties: true,
                },
            },
        },
        required: ['question', 'plans'],
        additionalProperties: true,
    },
};
function getQuestionsFromBody(questionsFromBody: QuestionsFromBody): Question[] {
    const questions: Question[] = [];
    for (const q of questionsFromBody) {
        const question = new Question();
        question.question = q.question || '';
        question.title = q.title ?? null;
        question.voiceOff = q.voiceOff || '';
        question.voiceOffBeginTime = q.voiceOffBeginTime || 0;
        question.soundUrl = q.soundUrl || '';
        question.soundVolume = q.soundVolume ?? 100;
        question.plans = [];
        for (const p of q.plans || []) {
            const plan = new Plan();
            plan.imageUrl = p.imageUrl || '';
            plan.description = p.description || '';
            plan.duration = p.duration ?? null;
            question.plans.push(plan);
        }
        questions.push(question);
    }
    return questions;
}

const getRelations = (includes: Set<string>): string[] | undefined => {
    const relations: string[] = [];
    if (includes.has('theme')) {
        relations.push('theme');
    }
    if (includes.has('scenario')) {
        relations.push('scenario');
    }
    return relations.length > 0 ? relations : undefined;
};

const projectController = new Controller('/projects');

projectController.get({ path: '', userType: UserType.CLASS }, async (req, res) => {
    if (!req.user) {
        throw new AppError('forbidden');
    }
    const includes = new Set((getQueryString(req.query.include) || '').split(','));
    const project = await getRepository(Project).find({
        where: {
            userId: req.user.id,
        },
        relations: getRelations(includes),
    });
    res.sendJSON(project);
});

projectController.get({ path: '/join/:joinCode(\\d+)' }, async (req, res, next) => {
    const joinCode = parseInt(req.params.joinCode, 10) || 0;
    const project: Project | undefined = await getRepository(Project).findOne({
        where: { joinCode },
        relations: ['questions'],
    });
    if (project === undefined) {
        next();
        return;
    }

    res.sendJSON(project);
});

projectController.get({ path: '/:id(\\d+)', userType: UserType.CLASS }, async (req, res, next) => {
    const user = req.user;
    if (user === undefined) {
        next();
        return;
    }
    const id = parseInt(req.params.id, 10) || 0;
    const includes = new Set((getQueryString(req.query.include) || '').split(','));
    const project: Project | undefined = await getRepository(Project).findOne({
        where: { id, userId: user.teacherId ?? user.id },
        relations: getRelations(includes),
    });
    if (project === undefined) {
        next();
        return;
    }

    if (includes.has('questions')) {
        project.questions = await getRepository(Question).find({
            where: { projectId: id },
            order: { index: 'ASC' },
            relations: includes.has('plans') ? ['plans'] : undefined,
        });
        project.questions.forEach((question) => {
            question.plans = question.plans.sort((a, b) => a.index - b.index);
        });
    }
    res.sendJSON(project);
});

type PostProjectData = {
    title: string;
    themeId: number;
    scenarioId: number;
    questions: QuestionsFromBody;
    soundUrl?: string | null;
    soundVolume?: number | null;
    musicBeginTime?: number;
    videoJobId?: string | null;
};
const POST_PROJECT_SCHEMA: JSONSchemaType<PostProjectData> = {
    type: 'object',
    properties: {
        title: {
            type: 'string',
            maxLength: 200,
        },
        themeId: {
            type: 'number',
        },
        scenarioId: {
            type: 'number',
        },
        questions: QUESTION_FROM_BODY_SCHEMA,
        soundUrl: {
            type: 'string',
            nullable: true,
        },
        soundVolume: {
            type: 'number',
            nullable: true,
            minimum: 0,
            maximum: 200,
        },
        musicBeginTime: {
            type: 'number',
            nullable: true,
        },
        videoJobId: {
            type: 'string',
            nullable: true,
        },
    },
    required: ['title', 'themeId', 'scenarioId', 'questions'],
    additionalProperties: false,
};
const postProjectValidator = ajv.compile(POST_PROJECT_SCHEMA);
projectController.post({ path: '/', userType: UserType.CLASS }, async (req, res, next) => {
    const user = req.user;
    if (user === undefined) {
        next();
        return;
    }

    // set collaboration mode to false on each user project
    await getConnection()
        .createQueryBuilder()
        .update(Project)
        .set({ isCollaborationActive: false, joinCode: null })
        .where({ userId: user.id, isCollaborationActive: true })
        .execute();

    const data = req.body;
    if (!postProjectValidator(data)) {
        sendInvalidDataError(postProjectValidator);
        return;
    }

    const newProject = new Project();
    newProject.title = data.title;
    newProject.themeId = data.themeId;
    newProject.scenarioId = data.scenarioId;
    newProject.userId = user.id;
    newProject.soundUrl = data.soundUrl || null;
    newProject.soundVolume = data.soundVolume || null;
    newProject.musicBeginTime = data.musicBeginTime || 0;
    newProject.videoJobId = data.videoJobId || null;
    const languageCode = getQueryString(req.query.languageCode) || req.cookies?.['app-language'] || 'fr';
    newProject.languageCode = languageCode;
    const newQuestions: Question[] = [];
    for (let questionIndex = 0; questionIndex < data.questions.length; questionIndex++) {
        const newQuestion = new Question();
        newQuestion.question = data.questions[questionIndex].question;
        newQuestion.index = questionIndex;
        newQuestion.title = data.questions[questionIndex].title || null;
        newQuestion.voiceOff = data.questions[questionIndex].voiceOff || null;
        newQuestion.voiceOffBeginTime = data.questions[questionIndex].voiceOffBeginTime || 0;
        newQuestion.soundUrl = data.questions[questionIndex].soundUrl || null;
        newQuestion.soundVolume = data.questions[questionIndex].soundVolume || null;
        const newPlans: Plan[] = [];
        for (let planIndex = 0; planIndex < data.questions[questionIndex].plans.length; planIndex++) {
            const newPlan = new Plan();
            newPlan.description = data.questions[questionIndex].plans[planIndex].description;
            newPlan.imageUrl = data.questions[questionIndex].plans[planIndex].imageUrl ?? null;
            newPlan.duration = data.questions[questionIndex].plans[planIndex].duration ?? null;
            newPlan.index = planIndex;
            newPlans.push(newPlan);
        }
        newQuestion.plans = newPlans;
        newQuestions.push(newQuestion);
    }
    newProject.questions = newQuestions;
    await getRepository(Project).save(newProject);
    res.sendJSON(newProject);
});

type PutProjectData = {
    title?: string;
    soundUrl?: string | null;
    soundVolume?: number | null;
    musicBeginTime?: number;
    isCollaborationActive?: boolean;
    joinCode?: number;
};
const PUT_PROJECT_SCHEMA: JSONSchemaType<PutProjectData> = {
    type: 'object',
    properties: {
        title: {
            type: 'string',
            maxLength: 200,
            nullable: true,
        },
        soundUrl: {
            type: 'string',
            nullable: true,
        },
        soundVolume: {
            type: 'number',
            nullable: true,
            minimum: 0,
            maximum: 200,
        },
        musicBeginTime: {
            type: 'number',
            nullable: true,
        },
        isCollaborationActive: {
            type: 'boolean',
            nullable: true,
        },
        joinCode: {
            type: 'number',
            nullable: true,
        },
    },
    required: [],
    additionalProperties: false,
    dependentSchemas: {
        isCollaborationActive: { required: ['joinCode'] },
    },
};
const putProjectValidator = ajv.compile(PUT_PROJECT_SCHEMA);
projectController.put({ path: '/:id', userType: UserType.CLASS }, async (req, res, next) => {
    const user = req.user;
    if (user === undefined) {
        next();
        return;
    }

    const data = req.body;
    if (!putProjectValidator(data)) {
        sendInvalidDataError(putProjectValidator);
        return;
    }

    const id = parseInt(req.params.id, 10) || 0;
    const project: Project | undefined = await getRepository(Project).findOne({ where: { id, userId: user.id } });
    if (project === undefined) {
        next();
        return;
    }

    project.title = data.title ?? project.title;
    project.soundUrl = data.soundUrl !== undefined ? data.soundUrl : project.soundUrl;
    project.soundVolume = data.soundVolume !== undefined ? data.soundVolume : project.soundVolume;
    project.musicBeginTime = data.musicBeginTime ?? project.musicBeginTime;
    if (data.isCollaborationActive === false) {
        project.isCollaborationActive = false;
        project.joinCode = null;
    } else if (data.isCollaborationActive === true) {
        project.isCollaborationActive = true;
        project.joinCode = data.joinCode || null;
        // set collaboration mode to false on each user project
        await getConnection()
            .createQueryBuilder()
            .update(Project)
            .set({ isCollaborationActive: false, joinCode: null })
            .where({ userId: user.id, isCollaborationActive: true })
            .execute();
    }
    await getRepository(Project).save(project);
    res.sendJSON(project);
});

type PostProjectPDFData = {
    themeName: string;
    scenarioName: string;
    scenarioDescription: string;
    projectId: number;
    projectTitle: string;
    questions: QuestionsFromBody;
    soundUrl?: string | null;
    soundVolume?: number | null;
    musicBeginTime?: number;
};
const POST_PROJECT_PDF_SCHEMA: JSONSchemaType<PostProjectPDFData> = {
    type: 'object',
    properties: {
        themeName: {
            type: 'string',
        },
        scenarioName: {
            type: 'string',
        },
        scenarioDescription: {
            type: 'string',
        },
        projectId: {
            type: 'number',
        },
        projectTitle: {
            type: 'string',
        },
        questions: QUESTION_FROM_BODY_SCHEMA,
        soundUrl: {
            type: 'string',
            nullable: true,
        },
        soundVolume: {
            type: 'number',
            nullable: true,
            minimum: 0,
            maximum: 200,
        },
        musicBeginTime: {
            type: 'number',
            nullable: true,
        },
    },
    required: ['questions', 'projectId', 'projectTitle', 'scenarioDescription', 'scenarioName', 'themeName'],
    additionalProperties: true,
};
const postProjectPdfValidator = ajv.compile(POST_PROJECT_PDF_SCHEMA);
projectController.post({ path: '/pdf' }, async (req, res) => {
    const data = req.body;
    if (!postProjectPdfValidator(data)) {
        sendInvalidDataError(postProjectPdfValidator);
        return;
    }
    const questions: Question[] = getQuestionsFromBody(data.questions);
    const url = await htmlToPDF(
        PDF.PLAN_DE_TOURNAGE,
        {
            themeName: data.themeName,
            scenarioName: data.scenarioName,
            scenarioDescription: data.scenarioDescription,
            pseudo: req.user !== undefined ? req.user.pseudo : undefined,
            questions,
            projectId: data.projectId,
            projectTitle: data.projectTitle,
        },
        req.body.languageCode || undefined,
    );
    res.sendJSON({ url });
});

type PostProjectMLTData = {
    projectTitle: string;
    scenarioName: string;
    questions: QuestionsFromBody;
    soundUrl?: string | null;
    soundVolume?: number | null;
    musicBeginTime?: number;
};
const POST_PROJECT_MLT_SCHEMA: JSONSchemaType<PostProjectMLTData> = {
    type: 'object',
    properties: {
        projectTitle: {
            type: 'string',
        },
        scenarioName: {
            type: 'string',
        },
        questions: QUESTION_FROM_BODY_SCHEMA,
        soundUrl: {
            type: 'string',
            nullable: true,
        },
        soundVolume: {
            type: 'number',
            nullable: true,
            minimum: 0,
            maximum: 200,
        },
        musicBeginTime: {
            type: 'number',
            nullable: true,
        },
    },
    required: ['projectTitle', 'scenarioName', 'questions'],
    additionalProperties: true,
};
const postProjectMltValidator = ajv.compile(POST_PROJECT_MLT_SCHEMA);
projectController.post({ path: '/mlt' }, async (req, res) => {
    const data = req.body;
    if (!postProjectMltValidator(data)) {
        sendInvalidDataError(postProjectMltValidator);
        return;
    }
    const questions: Question[] = getQuestionsFromBody(data.questions);
    const { mlt, files } = projectToXml(questions, data);

    const id: string = uuidv4();
    const directory: string = path.join(__dirname, '..', 'static/xml', id);
    await fs.mkdirs(directory);

    // Create output zip file-stream.
    const output = fs.createWriteStream(path.join(directory, `Montage.zip`));
    const archive = archiver('zip');
    archive.pipe(output);
    output.on('close', function () {
        res.sendJSON({ url: `${id}/Montage.zip` });
    });

    // Add files to the archive.
    archive.append(mlt, { name: 'Montage.mlt' });
    for (const file of files) {
        if (file.isLocal) {
            logger.info(`[MLT] get file from s3: ${file.name}`);
            const fileStream = await getFile(file.fileType, file.name);
            if (fileStream !== null) {
                archive.append(fileStream, { name: file.name });
            }
        } else {
            logger.info(`[MLT] fetch http file: ${file.name}`);
            try {
                http.get(file.name, (response) => {
                    archive.append(response, { name: file.name });
                });
            } catch (err) {
                // ignore
            }
        }
    }

    // good practice to catch this error explicitly
    archive.on('error', function (err) {
        throw err;
    });
    archive.finalize();
});

type MeltJob = {
    id: string;
    createdAt: string;
    status: 'waiting' | 'processing' | 'succeeded' | 'failed';
    progress: number; // from 0 to 100%
    outputs?: Array<{
        url: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
        duration?: number; // for videos and audios
    }>;
};
const buildServerUrl = process.env.BUILD_SERVER_URL;
projectController.get({ path: '/:id/video', userType: UserType.CLASS }, async (req, res, next) => {
    if (!buildServerUrl) {
        next();
        return;
    }
    const projectId = parseInt(req.params.id, 10) || 0;
    const project = await getRepository(Project)
        .createQueryBuilder()
        .addSelect('Project.videoJobId')
        .where('Project.id = :id', { id: projectId })
        .getOne();
    if (!project || !project.videoJobId) {
        next();
        return;
    }
    const jobResponse: MeltJob | null = await fetch(`${buildServerUrl}/api/v1/melt/${project.videoJobId}`)
        .then((response) => response.json())
        .catch(() => null);
    if (jobResponse) {
        res.status(200).sendJSON({
            progress: jobResponse.progress,
            url: jobResponse.outputs?.[0]?.url?.replace('/api/v1/melt/', '/api/videos/') || '',
        });
        return;
    }
    next();
});

projectController.post({ path: '/:id/video', userType: UserType.CLASS }, async (req, res, next) => {
    if (!buildServerUrl) {
        next();
        return;
    }

    // [1] Check project exist, project data is valid and project has not ongoing build.
    const data = req.body;
    const projectId = parseInt(req.params.id, 10) || 0;
    const project = await getRepository(Project)
        .createQueryBuilder()
        .addSelect('Project.videoJobId')
        .where('Project.id = :id', { id: projectId })
        .getOne();
    if (!project) {
        next();
        return;
    }
    if (!postProjectMltValidator(data)) {
        sendInvalidDataError(postProjectMltValidator);
        return;
    }
    if (project.videoJobId) {
        const jobResponse: MeltJob | null = await fetch(`${buildServerUrl}/api/v1/melt/${project.videoJobId}`)
            .then((response) => response.json())
            .catch(() => null);
        if (jobResponse !== null && jobResponse.progress !== 100) {
            next(); // prevent adding another job.
            return;
        }
    }

    // [2] Send build job.
    const questions: Question[] = getQuestionsFromBody(data.questions);
    const mlt = projectToMlt(questions, data).mlt;
    mlt.elements.push({
        name: 'consumer',
        attributes: {
            id: 'consumer0',
            target: `${sanitize(project.title.replace(/\s/g, '-')) || 'output'}.mp4`,
            // eslint-disable-next-line camelcase
            mlt_service: 'avformat',
            r: 25,
        },
    });
    const response: MeltJob | null = await fetch(`${buildServerUrl}/api/v1/melt`, {
        method: 'POST',
        body: JSON.stringify(mlt),
        headers: { 'Content-Type': 'application/json' },
    })
        .then((response) => response.json())
        .catch((err) => {
            logger.error(err);
            return null;
        });
    if (!response) {
        throw new AppError('unknown', ['Could not create video job']);
    }

    // [3] Save job id and return progress.
    const newProject = new Project();
    newProject.id = projectId;
    newProject.videoJobId = response.id;
    await getRepository(Project).save(newProject);
    res.status(200).sendJSON({
        progress: response.progress,
        url: response.outputs?.[0]?.url?.replace('/api/v1/melt/', '/api/videos/') || '',
    });
});

projectController.delete({ path: '/:id', userType: UserType.CLASS }, async (req, res) => {
    const user = req.user;
    if (user === undefined) {
        res.status(204).send();
        return;
    }

    const id = parseInt(req.params.id, 10) || 0;
    await getRepository(Project).softDelete({ id, userId: user.id });
    res.status(204).send();
});

export { projectController };
