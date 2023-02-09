import type { JSONSchemaType } from 'ajv';
import * as argon2 from 'argon2';
import type { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';

import { sendMail, Email } from '../emails';
import { User } from '../entities/user';
import { ajv, sendInvalidDataError } from '../lib/json-schema-validator';
import { logger } from '../lib/logger';
import { AppError } from '../middlewares/handle-errors';
import { generateToken } from '../utils/generate-token';
import { isPasswordValid } from '../utils/is-password-valid';
import { getAccessToken } from './lib/tokens';

const APP_SECRET: string = process.env.APP_SECRET || '';

// --- RESET PASSWORD ---
type ResetPasswordData = {
    email: string;
};
const RESET_SCHEMA: JSONSchemaType<ResetPasswordData> = {
    type: 'object',
    properties: {
        email: { type: 'string', format: 'email' },
    },
    required: ['email'],
    additionalProperties: false,
};
const resetValidator = ajv.compile(RESET_SCHEMA);
export async function resetPassword(req: Request, res: Response): Promise<void> {
    if (!req.isCsrfValid) {
        throw new AppError('forbidden');
    }

    const data = req.body;
    if (!resetValidator(data)) {
        sendInvalidDataError(resetValidator);
        return;
    }

    const email = data.email;
    const user = await getRepository(User).findOne({
        where: { email },
    });
    if (user === undefined) {
        throw new AppError('loginError', ['Unauthorized - Invalid username.'], 0);
    }

    const temporaryPassword = generateToken(12);
    user.verificationHash = await argon2.hash(temporaryPassword);
    await getRepository(User).save(user);

    // send mail with verification password
    await sendMail(Email.RESET_PASSWORD, user.email, { resetCode: temporaryPassword }, req.cookies?.['app-language'] || 'fr');
    res.sendJSON({ success: true });
}

// --- UPDATE PASSWORD ---
type UpdatePasswordData = {
    email: string;
    verifyToken: string;
    password: string;
};
const UPDATE_SCHEMA: JSONSchemaType<UpdatePasswordData> = {
    type: 'object',
    properties: {
        email: { type: 'string', format: 'email' },
        verifyToken: { type: 'string' },
        password: { type: 'string' },
    },
    required: ['email', 'verifyToken', 'password'],
    additionalProperties: false,
};
const updateValidator = ajv.compile(UPDATE_SCHEMA);
export async function updatePassword(req: Request, res: Response): Promise<void> {
    if (APP_SECRET.length === 0 || !req.isCsrfValid) {
        throw new AppError('forbidden');
    }

    const data = req.body;
    if (!updateValidator(data)) {
        sendInvalidDataError(updateValidator);
        return;
    }

    // get user
    const user = await getRepository(User)
        .createQueryBuilder()
        .addSelect('User.verificationHash')
        .where('User.email = :email', { email: data.email })
        .getOne();

    if (user === undefined) {
        throw new AppError('loginError', ['Unauthorized - Invalid username.'], 0);
    }

    if (user.accountRegistration === 10) {
        throw new AppError('loginError', ['Unauthorized - Please use SSO.'], 2);
    }

    // verify token
    let isverifyTokenCorrect: boolean = false;
    try {
        isverifyTokenCorrect = await argon2.verify(user.verificationHash || '', data.verifyToken);
    } catch (e) {
        logger.error(JSON.stringify(e));
    }
    if (!isverifyTokenCorrect) {
        throw new AppError('loginError', ['Unauthorized - Invalid verify token.'], 4);
    }

    // update password
    if (!isPasswordValid(data.password)) {
        throw new AppError('loginError', ['Unauthorized - Password too weak.'], 5);
    }
    user.passwordHash = await argon2.hash(data.password);
    user.accountRegistration = 0;
    user.verificationHash = '';
    await getRepository(User).save(user);

    // login user
    const { accessToken } = await getAccessToken(user.id, false);
    res.cookie('access-token', accessToken, {
        maxAge: 4 * 60 * 60000,
        expires: new Date(Date.now() + 4 * 60 * 60000),
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
    });
    delete user.passwordHash;
    delete user.verificationHash;
    res.sendJSON({ user, accessToken });
}

// --- Verify email. ---
type VerifyData = {
    email: string;
    verifyToken: string;
};
const VERIFY_SCHEMA: JSONSchemaType<VerifyData> = {
    type: 'object',
    properties: {
        email: { type: 'string', format: 'email' },
        verifyToken: { type: 'string' },
    },
    required: ['email', 'verifyToken'],
    additionalProperties: false,
};
const verifyUserValidator = ajv.compile(VERIFY_SCHEMA);
export async function verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!req.isCsrfValid) {
        throw new AppError('forbidden');
    }

    const data = req.body;
    if (!verifyUserValidator(data)) {
        sendInvalidDataError(verifyUserValidator);
        return;
    }

    const user = await getRepository(User)
        .createQueryBuilder()
        .addSelect('User.verificationHash')
        .where('User.email = :email', { email: data.email })
        .getOne();
    if (!user) {
        next();
        return;
    }

    let isverifyTokenCorrect: boolean = false;
    try {
        isverifyTokenCorrect = await argon2.verify(user.verificationHash || '', data.verifyToken);
    } catch (e) {
        logger.error(JSON.stringify(e));
    }
    if (!isverifyTokenCorrect) {
        throw new AppError('loginError', ['Unauthorized - Invalid verify token.'], 4);
    }

    // login user
    const { accessToken } = await getAccessToken(user.id, false);
    res.cookie('access-token', accessToken, {
        maxAge: 4 * 60 * 60000,
        expires: new Date(Date.now() + 4 * 60 * 60000),
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
    });
    delete user.verificationHash;
    res.sendJSON({ user, accessToken });
}
