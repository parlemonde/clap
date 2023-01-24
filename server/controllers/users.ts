import type { JSONSchemaType } from 'ajv';
import * as argon2 from 'argon2';
import type { Request } from 'express';
import type { FindManyOptions } from 'typeorm';
import { getRepository, Like } from 'typeorm';

import { getAccessToken } from '../authentication/lib/tokens';
// import { sendMail, Email } from "../emails";
import { logout } from '../authentication/logout';
import { Invite } from '../entities/invite';
import { Project } from '../entities/project';
import { Scenario } from '../entities/scenario';
import { Theme } from '../entities/theme';
import { User, UserType } from '../entities/user';
import { ajv, sendInvalidDataError } from '../lib/json-schema-validator';
import { AppError } from '../middlewares/handle-errors';
// import { AppError, ErrorCode } from '../middlewares/handleErrors';
import { generateToken } from '../utils/generate-token';
import { isPasswordValid } from '../utils/is-password-valid';
import { Controller } from './controller';

async function getUser(req: Request): Promise<User | undefined> {
    const id: number = parseInt(req.params.id, 10) || 0;
    if (req.user === undefined || (id !== req.user.id && req.user.type < UserType.PLMO_ADMIN)) {
        return undefined;
    }
    return await getRepository(User).findOne(id);
}

const userController = new Controller('/users');

userController.get({ path: '' }, async (req, res) => {
    const queryParams: FindManyOptions<User> = {
        order: {
            id: 'ASC',
        },
    };
    if (req.query.limit !== undefined) {
        queryParams.take = parseInt(req.query.limit as string, 10);
        if (req.query.page !== undefined && queryParams.take !== 0) {
            queryParams.skip = queryParams.take * (parseInt(req.query.page as string, 10) - 1);
        }
    }
    let direction: 'ASC' | 'DESC' = 'ASC';
    if (req.query.sort !== undefined) {
        direction = req.query.sort === 'DESC' || req.query.sort === 'desc' ? 'DESC' : 'ASC';
    }
    if (req.query.order !== undefined || req.query.orderBy !== undefined) {
        const orderBy = (req.query.order as string) || (req.query.orderBy as string);
        if (orderBy === 'id' || orderBy === 'pseudo' || orderBy === 'email' || orderBy === 'level' || orderBy === 'school') {
            queryParams.order = {
                [orderBy]: direction,
            };
        }
    }
    if (req.query.search) {
        queryParams.where = [
            { pseudo: Like(`%${req.query.search}%`) },
            { email: Like(`%${req.query.search}%`) },
            { school: Like(`%${req.query.search}%`) },
            { level: Like(`%${req.query.search}%`) },
        ];
    }
    const users: User[] = await getRepository(User).find(queryParams);
    const total = await getRepository(User).count();
    res.sendJSON({ users, total });
});

userController.get({ path: '/count' }, async (req, res) => {
    const userCount: number = await getRepository(User).count();
    res.sendJSON({ userCount });
});

userController.get({ path: '/:id' }, async (req, res, next) => {
    const user: User | undefined = await getUser(req);
    if (user === undefined) {
        next(); // will send 404 error
        return;
    }
    res.sendJSON(user);
});

userController.get({ path: '/test-pseudo/:pseudo' }, async (req, res) => {
    const nbUser: number = await getRepository(User)
        .createQueryBuilder()
        .where('LOWER(pseudo) = LOWER(:pseudo)', { pseudo: req.params.pseudo || '' })
        .getCount();
    res.sendJSON({ available: nbUser === 0 });
});

type PostUserData = {
    password?: string;
    inviteCode: string;
    email: string;
    pseudo: string;
    languageCode?: string;
};
const POST_USER_SCHEMA: JSONSchemaType<PostUserData> = {
    type: 'object',
    properties: {
        password: {
            type: 'string',
            nullable: true,
        },
        inviteCode: {
            type: 'string',
        },
        email: {
            type: 'string',
        },
        pseudo: {
            type: 'string',
        },
        languageCode: {
            type: 'string',
            nullable: true,
        },
    },
    required: ['inviteCode', 'email', 'pseudo'],
    additionalProperties: false,
};
const postUserValidator = ajv.compile(POST_USER_SCHEMA);
userController.post({ path: '' }, async (req, res) => {
    const data = req.body;
    if (!postUserValidator(data)) {
        sendInvalidDataError(postUserValidator);
        return;
    }

    if (data.password !== undefined && !isPasswordValid(data.password)) {
        throw new AppError('badRequest', ['Invalid password']);
    }

    const fromAdmin = req.user !== undefined && req.user.type === UserType.PLMO_ADMIN;
    if (!fromAdmin) {
        const isValid: boolean = (await getRepository(Invite).count({ where: { token: data.inviteCode } })) > 0;
        if (!isValid) {
            throw new AppError('forbidden', ['Invite code provided is invalid.']);
        } else {
            await getRepository(Invite).delete({ token: data.inviteCode });
        }
    }

    const user: User = new User();
    user.email = data.email;
    user.pseudo = data.pseudo;
    user.languageCode = data.languageCode || 'fr';
    user.school = '';
    user.accountRegistration = 0;
    user.passwordHash = await argon2.hash(data.password || generateToken(12));
    user.type = 0; // type class per default

    const verifyEmailPassword = generateToken(12);
    user.verificationHash = await argon2.hash(verifyEmailPassword);
    // Uncomment next line to block account on registration before email is not verified
    // user.accountRegistration = 3;
    // await sendMail(Email.VERIFY_EMAIL, user.email, { verifyCode: verifyEmailPassword, pseudo: user.pseudo }, user.languageCode);

    // save user
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
    res.sendJSON({ user: user, accessToken });
});

type PutUserData = {
    oldPassword?: string;
    password?: string;
    email?: string;
    pseudo?: string;
    languageCode?: string;
    type?: UserType;
};
const PUT_USER_SCHEMA: JSONSchemaType<PutUserData> = {
    type: 'object',
    properties: {
        oldPassword: {
            type: 'string',
            nullable: true,
        },
        password: {
            type: 'string',
            nullable: true,
        },
        email: {
            type: 'string',
            nullable: true,
        },
        pseudo: {
            type: 'string',
            nullable: true,
        },
        languageCode: {
            type: 'string',
            nullable: true,
        },
        type: {
            type: 'number',
            nullable: true,
        },
    },
    required: [],
    additionalProperties: false,
};
const putUserValidator = ajv.compile(PUT_USER_SCHEMA);
userController.put({ path: '/:id' }, async (req, res, next) => {
    const data = req.body;
    if (!putUserValidator(data)) {
        sendInvalidDataError(putUserValidator);
        return;
    }

    if (data.password !== undefined && !isPasswordValid(data.password)) {
        throw new AppError('badRequest', ['Invalid new password']);
    }

    const user: User | undefined = await getUser(req);
    if (user === undefined) {
        next(); // will send 404 error
        return;
    }

    user.email = data.email ?? user.email;
    user.pseudo = data.pseudo ?? user.pseudo;
    user.languageCode = data.languageCode ?? user.languageCode;
    if (data.type !== undefined && req.user && req.user.type >= UserType.ADMIN) {
        user.type = data.type;
    }
    if (data.password !== undefined) {
        if (!data.oldPassword) {
            throw new AppError('forbidden', ['Invalid password']);
        }
        const passwordHash = (
            await getRepository(User).createQueryBuilder().addSelect('User.passwordHash').where('User.id = :id', { id: user.id }).getOne()
        )?.passwordHash;
        if (!passwordHash || !(await argon2.verify(passwordHash, data.oldPassword))) {
            throw new AppError('forbidden', ['Invalid password']);
        }
        user.passwordHash = await argon2.hash(data.password);
    }

    await getRepository(User).save(user);
    delete user.passwordHash;
    res.sendJSON({ user: user });
});

userController.delete({ path: '/:id' }, async (req, res) => {
    const id: number = parseInt(req.params.id, 10) || 0;
    if (req.user === undefined || (id !== req.user.id && req.user.type < UserType.PLMO_ADMIN)) {
        res.status(204).send();
        return;
    }
    // will delete project with their questions and plans
    await getRepository(Project).delete({ user: { id } });
    await getRepository(Scenario).delete({ user: { id }, isDefault: false });
    await getRepository(Theme).delete({ user: { id }, isDefault: false });
    await getRepository(User).delete({ id: id });
    if (id === req.user.id) {
        logout(req, res);
    } else {
        res.status(204).send();
    }
});

userController.get({ path: '/invite' }, async (req, res) => {
    const invite = new Invite();
    invite.token = generateToken(20);
    await getRepository(Invite).save(invite);
    res.sendJSON({ inviteCode: invite.token });
});

userController.get({ path: '/check-invite/:inviteCode' }, async (req, res) => {
    const inviteCode: string = req.params.inviteCode || '';
    const isValid: boolean = (await getRepository(Invite).count({ where: { token: inviteCode } })) > 0;
    res.sendJSON({ isValid });
});

export { userController };
