import type { JSONSchemaType } from 'ajv';
import * as argon2 from 'argon2';
import type { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';

import { sendMail, Email } from '../emails';
import { User } from '../entities/user';
import { AppError, ErrorCode } from '../middlewares/handleErrors';
import { ajv, sendInvalidDataError } from '../utils/jsonSchemaValidator';
import { logger } from '../utils/logger';
import { generateTemporaryToken, isPasswordValid } from '../utils/utils';
import { getAccessToken } from './lib/tokens';

const secret: string = process.env.APP_SECRET || '';

// --- RESET PASSWORD ---
type ResetPasswordData = {
    email: string;
    languageCode?: string;
};
const RESET_SCHEMA: JSONSchemaType<ResetPasswordData> = {
    type: 'object',
    properties: {
        email: { type: 'string', format: 'email' },
        languageCode: { type: 'string', nullable: true },
    },
    required: ['email'],
    additionalProperties: false,
};
const resetValidator = ajv.compile(RESET_SCHEMA);
export async function resetPassword(req: Request, res: Response): Promise<void> {
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
        throw new AppError('Invalid email', ErrorCode.INVALID_USERNAME);
    }

    const temporaryPassword = generateTemporaryToken(12);
    user.verificationHash = await argon2.hash(temporaryPassword);
    await getRepository(User).save(user);

    // send mail with verification password
    await sendMail(Email.RESET_PASSWORD, user.email, { resetCode: temporaryPassword }, data.languageCode);
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
export async function updatePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (secret.length === 0) {
        next();
        return;
    }

    const data = req.body;
    if (!updateValidator(data)) {
        sendInvalidDataError(updateValidator);
        return;
    }

    // get user
    const email = data.email;
    const user = await getRepository(User).findOne({
        where: { email },
    });
    if (user === undefined) {
        throw new AppError('Invalid email', ErrorCode.INVALID_USERNAME);
    }

    if (user.accountRegistration === 10) {
        throw new AppError('Use SSO', ErrorCode.USE_SSO);
    }

    // verify token
    const verifyToken = data.verifyToken || '';
    let isverifyTokenCorrect: boolean = false;
    try {
        isverifyTokenCorrect = await argon2.verify(user.verificationHash || '', verifyToken);
    } catch (e) {
        logger.error(JSON.stringify(e));
    }
    if (!isverifyTokenCorrect) {
        throw new AppError('Invalid reset token', ErrorCode.INVALID_PASSWORD);
    }

    // update password
    const password = data.password;
    if (!isPasswordValid(password)) {
        throw new AppError('Invalid password', ErrorCode.PASSWORD_NOT_STRONG);
    }
    user.passwordHash = await argon2.hash(password);
    user.accountRegistration = 0;
    user.verificationHash = '';
    await getRepository(User).save(user);

    // login user
    const { accessToken } = await getAccessToken(user.id, false);
    res.cookie('access-token', accessToken, { maxAge: 4 * 60 * 60000, expires: new Date(Date.now() + 4 * 60 * 60000), httpOnly: true });
    res.sendJSON({ user: user.userWithoutPassword(), accessToken });
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
    const data = req.body;
    if (!verifyUserValidator(data)) {
        sendInvalidDataError(verifyUserValidator);
        return;
    }

    const user = await getRepository(User).findOne({
        where: { email: data.email },
    });
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
        throw new AppError('Invalid verify token', ErrorCode.INVALID_PASSWORD);
    }

    // save user
    user.accountRegistration = 0;
    user.verificationHash = '';
    await getRepository(User).save(user);

    // login user
    const { accessToken } = await getAccessToken(user.id, false);
    res.cookie('access-token', accessToken, { maxAge: 4 * 60 * 60000, expires: new Date(Date.now() + 4 * 60 * 60000), httpOnly: true });
    res.sendJSON({ user: user.userWithoutPassword(), accessToken });
}
