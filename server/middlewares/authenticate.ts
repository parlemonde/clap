import type { NextFunction, Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';

import { getNewAccessToken } from '../authentication/lib/tokens';
import { Project } from '../entities/project';
import { Question } from '../entities/question';
import type { UserType } from '../entities/user';
import { User } from '../entities/user';
import { ANONYMOUS_USER } from '../utils/anonymous-user';
import { getHeader } from '../utils/get-header';
import { AppError } from './handle-errors';

const APP_SECRET: string = process.env.APP_SECRET || '';

export function authenticate(userType: UserType | undefined = undefined): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (APP_SECRET.length === 0 || (!req.isCsrfValid && req.method !== 'GET')) {
            // check cookie was not stolen
            throw new AppError('forbidden');
        }

        let token: string;
        if (req.cookies && req.cookies['access-token']) {
            token = req.cookies['access-token'];
        } else if (req.cookies && req.cookies['refresh-token']) {
            const newTokens = await getNewAccessToken(req.cookies['refresh-token']);
            if (newTokens === null) {
                throw new AppError('forbidden');
            }
            // send new token
            token = newTokens.accessToken;
            res.cookie('access-token', newTokens.accessToken, {
                maxAge: 4 * 60 * 60000,
                expires: new Date(Date.now() + 4 * 60 * 60000),
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
            });
        } else {
            token = getHeader(req, 'x-access-token') || getHeader(req, 'authorization') || '';
        }

        if (token.startsWith('Bearer ')) {
            // Remove Bearer from string
            token = token.slice(7, token.length);
        }

        // no authentication
        if (userType === undefined && token.length === 0) {
            next();
            return;
        }

        if (token.length === 0) {
            throw new AppError('forbidden');
        }

        type AccessTokenType = {
            userId?: number;
            teacherId?: number;
            sequencyId?: number;
            projectId?: number;
            isStudent?: boolean;
            iat: number;
            exp: number;
        };

        // authenticate
        let data: AccessTokenType;
        try {
            const decoded: string | AccessTokenType = jwt.verify(token, APP_SECRET) as string | AccessTokenType;
            if (typeof decoded === 'string') {
                data = JSON.parse(decoded);
            } else {
                data = decoded;
            }
        } catch (e) {
            throw new AppError('forbidden');
        }

        if (data.isStudent) {
            const user: User = ANONYMOUS_USER;
            const teacher = await getRepository(User).findOne({ where: { id: data.teacherId } });
            const project = await getRepository(Project).findOne({ where: { id: data.projectId } });
            const sequency = await getRepository(Question).findOne({ where: { id: data.sequencyId }, relations: ['project', 'project.user'] });

            // Check if data are valid before continue
            if (
                teacher === undefined ||
                project === undefined ||
                sequency === undefined ||
                project.id !== sequency.project?.id ||
                teacher.id !== sequency.project?.user?.id ||
                project.isCollaborationActive !== true
            ) {
                throw new AppError('forbidden');
            }
            user.teacherId = teacher.id;
            req.user = user;
            next();
        } else {
            const user = await getRepository(User).findOne({ where: { id: data.userId } });
            if (userType !== undefined && (user === undefined || user.type < userType)) {
                throw new AppError('forbidden');
            }
            req.user = user;
            next();
        }
    };
}
