import type { JSONSchemaType } from 'ajv';
import { getRepository } from 'typeorm';

import { Plan } from '../entities/plan';
import { UserType } from '../entities/user';
import { ajv, sendInvalidDataError } from '../lib/json-schema-validator';
import { Controller } from './controller';

const planController = new Controller('/plans');

planController.get({ path: '' }, async (req, res) => {
    const plans = await getRepository(Plan).find();
    res.sendJSON(plans);
});

planController.get({ path: '/:id' }, async (req, res, next) => {
    const id = parseInt(req.params.id, 10) || 0;
    const plan: Plan | undefined = await getRepository(Plan).findOne({ where: { id } });
    if (plan === undefined) {
        next();
        return;
    }
    res.sendJSON(plan);
});

type PostPlanData = {
    questionId: number;
    description: string;
    index?: number;
    imageUrl?: string | null;
    duration?: number;
};
const POST_PLAN_SCHEMA: JSONSchemaType<PostPlanData> = {
    type: 'object',
    properties: {
        questionId: {
            type: 'number',
        },
        description: {
            type: 'string',
        },
        index: {
            type: 'number',
            nullable: true,
        },
        imageUrl: {
            type: 'string',
            nullable: true,
        },
        duration: {
            type: 'integer',
            nullable: true,
        },
    },
    required: ['questionId', 'description'],
    additionalProperties: false,
};
const postPlanValidator = ajv.compile(POST_PLAN_SCHEMA);
planController.post({ path: '/', userType: UserType.CLASS }, async (req, res, next) => {
    const user = req.user;
    if (user === undefined) {
        next();
        return;
    }

    const data = req.body;
    if (!postPlanValidator(data)) {
        sendInvalidDataError(postPlanValidator);
        return;
    }

    const newPlan = new Plan();
    newPlan.questionId = data.questionId;
    newPlan.description = data.description;
    newPlan.index = data.index || 0;
    newPlan.imageUrl = data.imageUrl ?? null;
    newPlan.duration = data.duration ?? null;
    await getRepository(Plan).insert(newPlan);
    res.sendJSON(newPlan);
});

type PutPlanData = {
    description?: string;
    index?: number;
    imageUrl?: string | null;
    duration?: number;
};
const PUT_PLAN_SCHEMA: JSONSchemaType<PutPlanData> = {
    type: 'object',
    properties: {
        description: {
            type: 'string',
            nullable: true,
        },
        index: {
            type: 'number',
            nullable: true,
        },
        imageUrl: {
            type: 'string',
            nullable: true,
        },
        duration: {
            type: 'integer',
            nullable: true,
        },
    },
    required: [],
    additionalProperties: false,
};
const putPlanValidator = ajv.compile(PUT_PLAN_SCHEMA);
planController.put({ path: '/:id', userType: UserType.ADMIN }, async (req, res, next) => {
    const user = req.user;
    if (user === undefined) {
        next();
        return;
    }

    const data = req.body;
    if (!putPlanValidator(data)) {
        sendInvalidDataError(putPlanValidator);
        return;
    }

    const id = parseInt(req.params.id, 10) || 0;
    const plan: Plan | undefined = await getRepository(Plan).findOne({ where: { id } });
    if (plan === undefined) {
        next();
        return;
    }

    plan.description = data.description ?? plan.description;
    plan.index = data.index ?? plan.index;
    plan.imageUrl = data.imageUrl !== undefined ? data.imageUrl : plan.imageUrl;
    plan.duration = data.duration !== undefined ? data.duration : plan.duration;
    await getRepository(Plan).save(plan);
    res.sendJSON(plan);
});

planController.delete({ path: '/:id', userType: UserType.ADMIN }, async (req, res) => {
    const id = parseInt(req.params.id, 10) || 0;
    await getRepository(Plan).delete({ id });
    res.status(204).send();
});

export { planController };
