import type { JSONSchemaType } from 'ajv';
import * as argon2 from 'argon2';
import type { Request, Response } from 'express';
import { getRepository, getConnection } from 'typeorm';

import { Project } from '../entities/project';
import { User } from '../entities/user';
import { ajv, sendInvalidDataError } from '../lib/json-schema-validator';
import { logger } from '../lib/logger';
import { AppError } from '../middlewares/handle-errors';
import { getAccessToken } from './lib/tokens';

const APP_SECRET: string = process.env.APP_SECRET || '';

// --- LOGIN ---
type LoginData = {
    username: string;
    password: string;
    getRefreshToken?: boolean;
};
const LOGIN_SCHEMA: JSONSchemaType<LoginData> = {
    type: 'object',
    properties: {
        username: { type: 'string' },
        password: { type: 'string' },
        getRefreshToken: { type: 'boolean', nullable: true },
    },
    required: ['username', 'password'],
    additionalProperties: false,
};
const loginValidator = ajv.compile(LOGIN_SCHEMA);
export async function login(req: Request, res: Response): Promise<void> {
    if (APP_SECRET.length === 0 || !req.isCsrfValid) {
        throw new AppError('forbidden');
    }
    const data = req.body;
    if (!loginValidator(data)) {
        sendInvalidDataError(loginValidator);
        return;
    }

    const user = await getRepository(User)
        .createQueryBuilder()
        .addSelect('User.passwordHash')
        .where('User.email = :username OR User.pseudo = :username', { username: data.username })
        .getOne();

    if (user === undefined) {
        throw new AppError('loginError', ['Unauthorized - Invalid username.'], 1);
    }

    let isPasswordCorrect: boolean = false;
    try {
        isPasswordCorrect = await argon2.verify(user.passwordHash || '', data.password);
    } catch (e) {
        logger.error(JSON.stringify(e));
    }

    if (user.accountRegistration === 4) {
        throw new AppError('forbidden', ['Unauthorized - Account blocked. Please reset password.'], 3);
    }

    if (!isPasswordCorrect) {
        user.accountRegistration += 1;
        await getRepository(User).save(user);
        throw new AppError('loginError', ['Unauthorized - Invalid password.'], 2);
    } else if (user.accountRegistration > 0 && user.accountRegistration < 4) {
        user.accountRegistration = 0;
        await getRepository(User).save(user);
    }

    // set collaboration mode to false on each user project
    await getConnection()
        .createQueryBuilder()
        .update(Project)
        .set({ isCollaborationActive: false, joinCode: false })
        .where({ userId: user.id, isCollaborationActive: true })
        .execute();

    const { accessToken, refreshToken } = await getAccessToken(user.id, !!data.getRefreshToken);
    res.cookie('access-token', accessToken, {
        maxAge: 4 * 60 * 60000,
        expires: new Date(Date.now() + 4 * 60 * 60000),
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
    });
    if (data.getRefreshToken) {
        res.cookie('refresh-token', refreshToken, {
            maxAge: 7 * 24 * 60 * 60000,
            expires: new Date(Date.now() + 7 * 24 * 60 * 60000),
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
        });
    }
    delete user.passwordHash;
    res.sendJSON({ user, accessToken, refreshToken: refreshToken });
}
