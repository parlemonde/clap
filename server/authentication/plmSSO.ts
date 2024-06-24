import type { JSONSchemaType } from 'ajv';
import type { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';

import { User } from '../entities/user';
import { getUserFromPLM } from '../legacy-plm/api';
import { ajv, sendInvalidDataError } from '../lib/json-schema-validator';
import { AppError } from '../middlewares/handle-errors';
import { getAccessToken } from './lib/tokens';

const APP_SECRET: string = process.env.APP_SECRET || '';

// --- LOGIN WITH PLM SSO---
type SsoData = {
    code: string;
};
const SSO_SCHEMA: JSONSchemaType<SsoData> = {
    type: 'object',
    properties: {
        code: { type: 'string' },
    },
    required: ['code'],
    additionalProperties: false,
};
const ssoValidator = ajv.compile(SSO_SCHEMA);
export async function loginWithPlmSSO(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (APP_SECRET.length === 0) {
        next();
        return;
    }
    const data = req.body;
    if (!ssoValidator(data)) {
        sendInvalidDataError(ssoValidator);
        return;
    }

    const user = await getUserFromPLM(data.code);
    if (user === null) {
        throw new AppError('forbidden', ['Could not connect with SSO']);
    }
    if (user.accountRegistration !== 10) {
        throw new AppError('forbidden', ['Please use normal login'], 6);
    }
    const { accessToken, refreshToken } = await getAccessToken(user.id, true);
    user.loginCount += 1;
    await getRepository(User).save(user);
    res.cookie('access-token', accessToken, {
        maxAge: 4 * 60 * 60000,
        expires: new Date(Date.now() + 4 * 60 * 60000),
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
    });
    res.cookie('refresh-token', refreshToken, {
        maxAge: 7 * 24 * 60 * 60000,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60000),
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
    });
    res.sendJSON({ user, accessToken, refreshToken: refreshToken });
}
