import * as argon2 from 'argon2';
import type { NextFunction, Request, Response } from 'express';
import type { FindManyOptions } from 'typeorm';
import { getRepository, Like } from 'typeorm';

import { getAccessToken } from '../authentication/lib/tokens';
// import { sendMail, Email } from "../emails";
import { Invite } from '../entities/invite';
import { Project } from '../entities/project';
import { Scenario } from '../entities/scenario';
import { Theme } from '../entities/theme';
import { User, UserType } from '../entities/user';
import { AppError, ErrorCode } from '../middlewares/handleErrors';
import { isPasswordValid, generateTemporaryToken } from '../utils/utils';
import { Controller, del, get, post, put } from './controller';

function updateUser(user: User, req: Request): void {
    // if (req.body.managerFirstName) user.managerFirstName = req.body.managerFirstName;
    // if (req.body.managerLastName) user.managerLastName = req.body.managerLastName;
    if (req.body.email) user.email = req.body.email;
    if (req.body.level !== undefined) user.level = req.body.level;
    if (req.body.pseudo) user.pseudo = req.body.pseudo;
    if (req.body.languageCode) user.languageCode = req.body.languageCode;
    if (req.body.school !== undefined) user.school = req.body.school;
}

async function getUser(req: Request): Promise<User | undefined> {
    const id: number = parseInt(req.params.id, 10) || 0;
    if (req.user === undefined || (id !== req.user.id && req.user.type < UserType.PLMO_ADMIN)) {
        return undefined;
    }
    return await getRepository(User).findOne(id);
}

export class UserController extends Controller {
    constructor() {
        super('users');
    }

    @get({ userType: UserType.PLMO_ADMIN })
    public async getUsers(req: Request, res: Response): Promise<void> {
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
        res.sendJSON(users.map((u) => u.userWithoutPassword()));
    }

    @get({ path: '/count', userType: UserType.PLMO_ADMIN })
    public async getUserCount(_: Request, res: Response): Promise<void> {
        const userCount: number = await getRepository(User).count();
        res.sendJSON({ userCount });
    }

    @get({ path: '/:id' })
    public async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        const user: User | undefined = await getUser(req);
        if (user === undefined) {
            next(); // will send 404 error
            return;
        }
        res.sendJSON(user.userWithoutPassword());
    }

    @get({ path: '/test-pseudo/:pseudo' })
    public async getUserByPseudo(req: Request, res: Response): Promise<void> {
        const nbUser: number = await getRepository(User)
            .createQueryBuilder()
            .where('LOWER(pseudo) = LOWER(:pseudo)', { pseudo: req.params.pseudo || '' })
            .getCount();
        res.sendJSON({ available: nbUser === 0 });
    }

    @post()
    public async addUser(req: Request, res: Response): Promise<void> {
        const password = req.body.password;
        if (password && !isPasswordValid(password)) {
            throw new Error('Invalid password');
        }

        const fromAdmin = req.user !== undefined && req.user.type === UserType.PLMO_ADMIN;
        if (!fromAdmin && req.body.inviteCode === undefined) {
            throw new Error('No invite code was provided.');
        } else if (!fromAdmin) {
            const inviteCode: string = req.body.inviteCode || '';
            const isValid: boolean = (await getRepository(Invite).count({ where: { token: inviteCode } })) > 0;
            if (!isValid) {
                throw new Error('Invite code provided is invalid.');
            } else {
                await getRepository(Invite).delete({ token: inviteCode });
            }
        }

        const user: User = new User();
        updateUser(user, req);
        user.passwordHash = await argon2.hash(password || generateTemporaryToken(12));
        user.type = 0; // type class per default

        const verifyEmailPassword = generateTemporaryToken(12);
        user.verificationHash = await argon2.hash(verifyEmailPassword);
        // Uncomment next line to block account on registration before email is not verified
        // user.accountRegistration = 3;
        // await sendMail(Email.VERIFY_EMAIL, user.email, { verifyCode: verifyEmailPassword, pseudo: user.pseudo }, user.languageCode);

        // save user
        await getRepository(User).save(user);

        // login user
        const { accessToken } = await getAccessToken(user.id, false);
        res.cookie('access-token', accessToken, { maxAge: 4 * 60 * 60000, expires: new Date(Date.now() + 4 * 60 * 60000), httpOnly: true });
        res.sendJSON({ user: user.userWithoutPassword(), accessToken });
    }

    @put({ path: '/:id' })
    public async editUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        const user: User | undefined = await getUser(req);
        if (user === undefined) {
            next(); // will send 404 error
            return;
        }
        if (req.user !== undefined && req.user.type === UserType.PLMO_ADMIN && req.body.type !== undefined) {
            user.type = req.body.type;
        }
        updateUser(user, req);
        if (req.body.password && req.body.oldPassword) {
            if (isPasswordValid(req.body.password) && (await argon2.verify(user.passwordHash || '', req.body.oldPassword))) {
                user.passwordHash = await argon2.hash(req.body.password);
            } else {
                throw new AppError('Invalid password or old password', ErrorCode.INVALID_PASSWORD);
            }
        }
        await getRepository(User).save(user);
        res.sendJSON(user.userWithoutPassword()); // send updated user
    }

    @del({ path: '/:id', userType: UserType.CLASS })
    public async deleteUser(req: Request, res: Response): Promise<void> {
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
            // logout
            res.cookie('access-token', '', { maxAge: 0, expires: new Date(0), httpOnly: true });
            res.cookie('refresh-token', '', { maxAge: 0, expires: new Date(0), httpOnly: true });
        }
        res.status(204).send();
    }

    @get({ path: '/invite', userType: UserType.PLMO_ADMIN })
    public async getInviteCode(_: Request, res: Response): Promise<void> {
        const invite = new Invite();
        invite.token = generateTemporaryToken(20);
        await getRepository(Invite).save(invite);
        res.sendJSON({ inviteCode: invite.token });
    }

    @get({ path: '/check-invite/:inviteCode' })
    public async isInviteCodeValid(req: Request, res: Response): Promise<void> {
        const inviteCode: string = req.params.inviteCode || '';
        const isValid: boolean = (await getRepository(Invite).count({ where: { token: inviteCode } })) > 0;
        res.sendJSON({ isValid });
    }
}
