import type { JSONSchemaType } from 'ajv';
import type { FindConditions } from 'typeorm';
import { getConnection, getRepository } from 'typeorm';

import { QuestionTemplate } from '../entities/question-template';
import { Scenario } from '../entities/scenario';
import { UserType } from '../entities/user';
import { ajv, sendInvalidDataError } from '../lib/json-schema-validator';
import { getQueryString } from '../utils/get-query-string';
import { Controller } from './controller';

const scenarioController = new Controller('/scenarios');

type QuestionsCountResult = Array<{ scenarioId: number; questionsCount: Record<string, number> }>;

scenarioController.get({ path: '' }, async (req, res) => {
    const isDefault = getQueryString(req.query.isDefault) === 'true' || getQueryString(req.query.isDefault) === '';
    const getSelf = getQueryString(req.query.self) !== undefined;
    const queryThemeId = getQueryString(req.query.themeId);
    const themeId = queryThemeId !== undefined ? parseInt(queryThemeId, 10) || 0 : undefined;

    const params: FindConditions<Scenario>[] = [
        themeId !== undefined
            ? {
                  isDefault,
                  themeId,
              }
            : { isDefault },
    ];
    if (getSelf && req.user !== undefined) {
        params.push(
            themeId !== undefined
                ? {
                      userId: req.user.id,
                      themeId,
                  }
                : { userId: req.user.id },
        );
    }
    const scenarios = await getRepository(Scenario).find({ where: params, order: { isDefault: 'DESC' } });
    if (scenarios.length > 0) {
        const questionsCounts = await getConnection()
            .createQueryBuilder()
            .select('`scenarioId`', 'scenarioId')
            .addSelect('JSON_OBJECTAGG(`languageCode`, `count`)', 'questionsCount')
            .from(
                (qb2) =>
                    qb2
                        .select('question.scenarioId', 'scenarioId')
                        .addSelect('question.languageCode', 'languageCode')
                        .addSelect('COUNT(*)', 'count')
                        .from(QuestionTemplate, 'question')
                        .where('scenarioId IN (:...ids)', { ids: scenarios.map((s) => s.id) })
                        .groupBy('scenarioId')
                        .addGroupBy('languageCode'),
                'inner1',
            )
            .groupBy('scenarioId')
            .getRawMany()
            .then((data: QuestionsCountResult) =>
                data.reduce<Record<number, Record<string, number>>>((acc, row) => {
                    acc[row.scenarioId] = row.questionsCount;
                    return acc;
                }, {}),
            );
        for (const scenario of scenarios) {
            scenario.questionsCount = questionsCounts[scenario.id] || {};
        }
    }
    res.sendJSON(scenarios);
});

scenarioController.get({ path: '/:id' }, async (req, res, next) => {
    const id = parseInt(req.params.id, 10) || 0;
    const scenario: Scenario | undefined = await getRepository(Scenario).findOne({ where: { id } });
    if (scenario === undefined) {
        next();
        return;
    }
    res.sendJSON(scenario);
});

type PostScenarioData = {
    names: Record<string, string>;
    descriptions?: Record<string, string>;
    themeId: number;
    isDefault?: boolean;
};
const POST_SCENARIO_SCHEMA: JSONSchemaType<PostScenarioData> = {
    type: 'object',
    properties: {
        names: {
            type: 'object',
            additionalProperties: {
                type: 'string',
                pattern: '([^\\s]*)',
            },
            required: [],
        },
        descriptions: {
            type: 'object',
            additionalProperties: {
                type: 'string',
            },
            required: [],
            nullable: true,
        },
        themeId: {
            type: 'number',
        },
        isDefault: {
            type: 'boolean',
            nullable: true,
        },
    },
    required: ['names', 'themeId'],
    additionalProperties: false,
};
const postScenarioValidator = ajv.compile(POST_SCENARIO_SCHEMA);
scenarioController.post({ path: '/', userType: UserType.CLASS }, async (req, res, next) => {
    const user = req.user;
    if (user === undefined) {
        next();
        return;
    }

    const data = req.body;
    if (!postScenarioValidator(data)) {
        sendInvalidDataError(postScenarioValidator);
        return;
    }

    const newScenario = new Scenario();
    newScenario.names = data.names;
    newScenario.descriptions = data.descriptions || {};
    newScenario.themeId = data.themeId;
    if (data.isDefault && user.type >= UserType.ADMIN) {
        newScenario.isDefault = true;
    } else {
        newScenario.userId = user.id;
    }

    await getRepository(Scenario).insert(newScenario);
    res.sendJSON(newScenario);
});

type PutScenarioData = {
    names?: Record<string, string>;
    descriptions?: Record<string, string>;
    isDefault?: boolean;
};
const PUT_SCENARIO_SCHEMA: JSONSchemaType<PutScenarioData> = {
    type: 'object',
    properties: {
        names: {
            type: 'object',
            additionalProperties: {
                type: 'string',
                pattern: '([^\\s]*)',
            },
            required: [],
            nullable: true,
        },
        descriptions: {
            type: 'object',
            additionalProperties: {
                type: 'string',
            },
            required: [],
            nullable: true,
        },
        isDefault: {
            type: 'boolean',
            nullable: true,
        },
    },
    required: [],
    additionalProperties: false,
};
const putScenarioValidator = ajv.compile(PUT_SCENARIO_SCHEMA);
scenarioController.put({ path: '/:id', userType: UserType.ADMIN }, async (req, res, next) => {
    const user = req.user;
    if (user === undefined) {
        next();
        return;
    }

    const data = req.body;
    if (!putScenarioValidator(data)) {
        sendInvalidDataError(putScenarioValidator);
        return;
    }

    const id = parseInt(req.params.id, 10) || 0;
    const scenario: Scenario | undefined = await getRepository(Scenario).findOne({ where: { id } });
    if (scenario === undefined) {
        next();
        return;
    }

    scenario.isDefault = data.isDefault ?? scenario.isDefault;
    scenario.names = { ...scenario.names, ...(data.names || {}) };
    scenario.descriptions = { ...scenario.descriptions, ...(data.descriptions || {}) };
    await getRepository(Scenario).save(scenario);
    res.sendJSON(scenario);
});

scenarioController.delete({ path: '/:id', userType: UserType.ADMIN }, async (req, res) => {
    const id = parseInt(req.params.id, 10) || 0;
    await getRepository(Scenario).softDelete({ id });
    res.status(204).send();
});

export { scenarioController };
