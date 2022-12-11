import type { JSONSchemaType } from 'ajv';
import type { FindConditions } from 'typeorm';
import { getManager, getRepository } from 'typeorm';

import { Theme } from '../entities/theme';
import { UserType } from '../entities/user';
import { ajv, sendInvalidDataError } from '../lib/json-schema-validator';
import { getQueryString } from '../utils/get-query-string';
import { Controller } from './controller';

const themeController = new Controller('/themes');

themeController.get({ path: '' }, async (req, res) => {
    const isDefault = getQueryString(req.query.isDefault) === 'true' || getQueryString(req.query.isDefault) === '';
    const getSelf = getQueryString(req.query.self) !== undefined;
    const includes = new Set((getQueryString(req.query.include) || '').split(','));

    const params: FindConditions<Theme>[] = [
        {
            isDefault,
        },
    ];
    if (getSelf && req.user !== undefined) {
        params.push({
            userId: req.user.id,
        });
    }

    const themes = await getRepository(Theme).find({
        where: params,
        order: { isDefault: 'DESC', order: 'ASC' },
        relations: includes.has('scenarios') ? ['scenarios'] : undefined,
    });
    res.sendJSON(themes);
});

themeController.get({ path: '/:id' }, async (req, res, next) => {
    const id = parseInt(req.params.id, 10) || 0;
    const theme: Theme | undefined = await getRepository(Theme).findOne({ where: { id } });
    if (theme === undefined) {
        next();
        return;
    }
    res.sendJSON(theme);
});

type PostThemeData = {
    names: Record<string, string>;
    isDefault?: boolean;
    order?: number;
    imageUrl?: string;
};
const POST_THEME_SCHEMA: JSONSchemaType<PostThemeData> = {
    type: 'object',
    properties: {
        names: {
            type: 'object',
            additionalProperties: {
                type: 'string',
            },
            required: [],
        },
        isDefault: {
            type: 'boolean',
            nullable: true,
        },
        order: {
            type: 'number',
            nullable: true,
        },
        imageUrl: {
            type: 'string',
            maxLength: 4000,
            nullable: true,
        },
    },
    required: ['names'],
    additionalProperties: false,
};
const postThemeValidator = ajv.compile(POST_THEME_SCHEMA);
themeController.post({ path: '/', userType: UserType.CLASS }, async (req, res, next) => {
    const user = req.user;
    if (user === undefined) {
        next();
        return;
    }

    const data = req.body;
    if (!postThemeValidator(data)) {
        sendInvalidDataError(postThemeValidator);
        return;
    }

    const newTheme = new Theme();
    newTheme.names = data.names;
    if (data.isDefault && user.type >= UserType.ADMIN) {
        newTheme.isDefault = true;
        newTheme.imageUrl = data.imageUrl || null;
        newTheme.order = data.order || 0;
    } else {
        newTheme.userId = user.id;
    }

    await getRepository(Theme).insert(newTheme);
    res.sendJSON(newTheme);
});

type PutThemeOrderData = {
    order: number[];
};
const PUT_THEME_ORDER_SCHEMA: JSONSchemaType<PutThemeOrderData> = {
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
const putThemeOrderValidator = ajv.compile(PUT_THEME_ORDER_SCHEMA);
themeController.put({ path: '/order', userType: UserType.ADMIN }, async (req, res, next) => {
    const user = req.user;
    if (user === undefined) {
        next();
        return;
    }

    const data = req.body;
    if (!putThemeOrderValidator(data)) {
        sendInvalidDataError(putThemeOrderValidator);
        return;
    }

    const themes: Theme[] = [];
    for (let i = 0; i < data.order.length; i++) {
        const theme = new Theme();
        theme.id = data.order[i];
        theme.order = i;
        themes.push(theme);
    }

    await getManager().transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.save(themes);
    });
    res.status(204).send();
});

type PutThemeData = {
    names?: Record<string, string>;
    isDefault?: boolean;
    imageUrl?: string;
    order?: number;
};
const PUT_THEME_SCHEMA: JSONSchemaType<PutThemeData> = {
    type: 'object',
    properties: {
        names: {
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
        imageUrl: {
            type: 'string',
            maxLength: 4000,
            nullable: true,
        },
        order: {
            type: 'number',
            nullable: true,
        },
    },
    required: [],
    additionalProperties: false,
};
const putThemeValidator = ajv.compile(PUT_THEME_SCHEMA);
themeController.put({ path: '/:id', userType: UserType.ADMIN }, async (req, res, next) => {
    const user = req.user;
    if (user === undefined) {
        next();
        return;
    }

    const data = req.body;
    if (!putThemeValidator(data)) {
        sendInvalidDataError(putThemeValidator);
        return;
    }

    const id = parseInt(req.params.id, 10) || 0;
    const theme: Theme | undefined = await getRepository(Theme).findOne({ where: { id } });
    if (theme === undefined) {
        next();
        return;
    }

    theme.isDefault = data.isDefault ?? theme.isDefault;
    theme.imageUrl = data.imageUrl ?? theme.imageUrl;
    theme.names = { ...theme.names, ...(data.names || {}) };
    theme.order = data.order ?? theme.order;
    await getRepository(Theme).save(theme);
    res.sendJSON(theme);
});

themeController.delete({ path: '/:id', userType: UserType.ADMIN }, async (req, res) => {
    const id = parseInt(req.params.id, 10) || 0;
    await getRepository(Theme).softDelete({ id });
    res.status(204).send();
});

export { themeController };
