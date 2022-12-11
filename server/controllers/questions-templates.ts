import type { JSONSchemaType } from 'ajv';
import type { FindConditions } from 'typeorm';
import { getManager, getRepository } from 'typeorm';

import { QuestionTemplate } from '../entities/question-template';
import { UserType } from '../entities/user';
import { ajv, sendInvalidDataError } from '../lib/json-schema-validator';
import { getQueryString } from '../utils/get-query-string';
import { Controller } from './controller';

const questionTemplateController = new Controller('/questions-templates');

questionTemplateController.get({ path: '' }, async (req, res) => {
    const queryScenarioId = getQueryString(req.query.scenarioId);
    const scenarioId = queryScenarioId !== undefined ? parseInt(queryScenarioId, 10) || 0 : undefined;
    const languageCode = getQueryString(req.query.languageCode) || req.cookies?.['app-language'] || 'fr';

    const params: FindConditions<QuestionTemplate> = {
        languageCode,
    };
    if (scenarioId !== undefined) {
        params.scenarioId = scenarioId;
    }

    const questions = await getRepository(QuestionTemplate).find({
        where: params,
        order: { index: 'ASC' },
    });
    res.sendJSON(questions);
});

questionTemplateController.get({ path: '/:id' }, async (req, res, next) => {
    const id = parseInt(req.params.id, 10) || 0;
    const question: QuestionTemplate | undefined = await getRepository(QuestionTemplate).findOne({ where: { id } });
    if (question === undefined) {
        next();
        return;
    }
    res.sendJSON(question);
});

type PostQuestionData = {
    question: string;
    index?: number;
    languageCode?: string;
    scenarioId: number;
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
        scenarioId: {
            type: 'number',
            nullable: false,
        },
        languageCode: {
            type: 'string',
            minLength: 2,
            maxLength: 2,
            nullable: true,
        },
    },
    required: ['question', 'scenarioId'],
    additionalProperties: false,
};
const postQuestionValidator = ajv.compile(POST_QUESTION_SCHEMA);
questionTemplateController.post({ path: '/', userType: UserType.ADMIN }, async (req, res, next) => {
    const user = req.user;
    if (user === undefined) {
        next();
        return;
    }

    const data = req.body;
    if (!postQuestionValidator(data)) {
        sendInvalidDataError(postQuestionValidator);
        return;
    }

    const newQuestion = new QuestionTemplate();
    newQuestion.question = data.question;
    newQuestion.index = data.index || 0;
    newQuestion.languageCode = data.languageCode || req.cookies?.['app-language'] || 'fr';
    newQuestion.scenarioId = data.scenarioId;
    await getRepository(QuestionTemplate).insert(newQuestion);
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
questionTemplateController.put({ path: '/order', userType: UserType.ADMIN }, async (req, res) => {
    const data = req.body;
    if (!putQuestionOrderValidator(data)) {
        sendInvalidDataError(putQuestionOrderValidator);
        return;
    }

    const questions: QuestionTemplate[] = [];
    for (let i = 0; i < data.order.length; i++) {
        const question = new QuestionTemplate();
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
};
const PUT_QUESTION_SCHEMA: JSONSchemaType<PutQuestionData> = {
    type: 'object',
    properties: {
        question: {
            type: 'string',
            nullable: true,
        },
    },
    required: [],
    additionalProperties: false,
};
const putQuestionValidator = ajv.compile(PUT_QUESTION_SCHEMA);
questionTemplateController.put({ path: '/:id', userType: UserType.ADMIN }, async (req, res, next) => {
    const data = req.body;
    if (!putQuestionValidator(data)) {
        sendInvalidDataError(putQuestionValidator);
        return;
    }

    const id = parseInt(req.params.id, 10) || 0;
    const question: QuestionTemplate | undefined = await getRepository(QuestionTemplate).findOne({ where: { id } });
    if (question === undefined) {
        next();
        return;
    }

    question.question = data.question ?? question.question;
    await getRepository(QuestionTemplate).save(question);
    res.sendJSON(question);
});

questionTemplateController.delete({ path: '/:id', userType: UserType.ADMIN }, async (req, res) => {
    const id = parseInt(req.params.id, 10) || 0;
    await getRepository(QuestionTemplate).delete({ id });
    res.status(204).send();
});

export { questionTemplateController };
