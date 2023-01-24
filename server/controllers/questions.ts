import type { JSONSchemaType } from 'ajv';
import type { FindConditions } from 'typeorm';
import { getManager, getRepository } from 'typeorm';

import type { Title } from '../../types/models/title.type';
import { Question } from '../entities/question';
import { UserType } from '../entities/user';
import { ajv, sendInvalidDataError } from '../lib/json-schema-validator';
import { getQueryString } from '../utils/get-query-string';
import { Controller } from './controller';

const questionController = new Controller('/questions');

questionController.get({ path: '', userType: UserType.CLASS }, async (req, res) => {
    const queryProjectId = getQueryString(req.query.projectId);
    const projectId = queryProjectId !== undefined ? parseInt(queryProjectId, 10) || 0 : undefined;
    const includes = new Set((getQueryString(req.query.include) || '').split(','));

    const params: FindConditions<Question> = {};
    if (projectId !== undefined) {
        params.projectId = projectId;
    }

    const questions = await getRepository(Question).find({
        where: params,
        order: { index: 'ASC' },
        relations: includes.has('plans') ? ['plans'] : undefined,
    });
    if (includes.has('plans')) {
        questions.forEach((question) => {
            question.plans = question.plans.sort((a, b) => a.index - b.index);
        });
    }
    res.sendJSON(questions);
});

questionController.get({ path: '/:id', userType: UserType.CLASS }, async (req, res, next) => {
    const id = parseInt(req.params.id, 10) || 0;
    const question: Question | undefined = await getRepository(Question).findOne({ where: { id } });
    if (question === undefined) {
        next();
        return;
    }
    res.sendJSON(question);
});

type PostQuestionData = {
    projectId: number;
    question: string;
    index?: number;
    title?: Title | null;
    voiceOff?: string | null;
    voiceOffBeginTime?: number;
    soundUrl?: string | null;
    soundVolume?: number | null;
};
const POST_QUESTION_SCHEMA: JSONSchemaType<PostQuestionData> = {
    type: 'object',
    properties: {
        question: {
            type: 'string',
            maxLength: 280,
        },
        index: {
            type: 'number',
            nullable: true,
        },
        projectId: {
            type: 'number',
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
    },
    required: ['question', 'projectId'],
    additionalProperties: false,
};
const postQuestionValidator = ajv.compile(POST_QUESTION_SCHEMA);
questionController.post({ path: '/', userType: UserType.CLASS }, async (req, res) => {
    const data = req.body;
    if (!postQuestionValidator(data)) {
        sendInvalidDataError(postQuestionValidator);
        return;
    }

    const newQuestion = new Question();
    newQuestion.question = data.question;
    newQuestion.index = data.index || 0;
    newQuestion.projectId = data.projectId;
    newQuestion.title = data.title || null;
    newQuestion.voiceOff = data.voiceOff || null;
    newQuestion.voiceOffBeginTime = data.voiceOffBeginTime || 0;
    newQuestion.soundUrl = data.soundUrl || null;
    newQuestion.soundVolume = data.soundVolume || null;
    await getRepository(Question).insert(newQuestion);
    res.sendJSON(newQuestion);
});

type PutQuestionOrderData = {
    order: number[];
};
const PUT_QUESTION_ORDER_SCHEMA: JSONSchemaType<PutQuestionOrderData> = {
    type: 'object',
    properties: {
        order: {
            type: 'array',
            items: {
                type: 'number',
            },
        },
    },
    required: ['order'],
    additionalProperties: false,
};
const putQuestionOrderValidator = ajv.compile(PUT_QUESTION_ORDER_SCHEMA);
questionController.put({ path: '/order', userType: UserType.CLASS }, async (req, res) => {
    const data = req.body;
    if (!putQuestionOrderValidator(data)) {
        sendInvalidDataError(putQuestionOrderValidator);
        return;
    }

    const questions: Question[] = [];
    for (let i = 0; i < data.order.length; i++) {
        const question = new Question();
        question.id = data.order[i];
        question.index = i;
        questions.push(question);
    }

    await getManager().transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.save(questions);
    });
    res.status(204).send();
});

type PutQuestionData = {
    question?: string;
    title?: Title | null;
    voiceOff?: string | null;
    voiceOffBeginTime?: number;
    soundUrl?: string | null;
    soundVolume?: number | null;
};
const PUT_QUESTION_SCHEMA: JSONSchemaType<PutQuestionData> = {
    type: 'object',
    properties: {
        question: {
            type: 'string',
            nullable: true,
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
    },
    required: [],
    additionalProperties: false,
};
const putQuestionValidator = ajv.compile(PUT_QUESTION_SCHEMA);
questionController.put({ path: '/:id', userType: UserType.CLASS }, async (req, res, next) => {
    const data = req.body;
    if (!putQuestionValidator(data)) {
        sendInvalidDataError(putQuestionValidator);
        return;
    }

    const id = parseInt(req.params.id, 10) || 0;
    const question: Question | undefined = await getRepository(Question).findOne({ where: { id } });
    if (question === undefined) {
        next();
        return;
    }

    question.question = data.question ?? question.question;
    question.title = data.title !== undefined ? data.title : question.title;
    question.voiceOff = data.voiceOff !== undefined ? data.voiceOff : question.voiceOff;
    question.voiceOffBeginTime = data.voiceOffBeginTime || 0;
    question.soundUrl = data.soundUrl !== undefined ? data.soundUrl : question.soundUrl;
    question.soundVolume = data.soundVolume !== undefined ? data.soundVolume : question.soundVolume;
    await getRepository(Question).save(question);
    res.sendJSON(question);
});

questionController.delete({ path: '/:id', userType: UserType.CLASS }, async (req, res) => {
    const id = parseInt(req.params.id, 10) || 0;
    await getRepository(Question).delete({ id });
    res.status(204).send();
});

export { questionController };
