import type { NextFunction, Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';

import { getNewAccessToken } from '../authentication/lib/tokens';
import type { UserType } from '../entities/user';
import { User } from '../entities/user';
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

        // authenticate
        let data: { userId: number; iat: number; exp: number };
        try {
            const decoded: string | { userId: number; iat: number; exp: number } = jwt.verify(token, APP_SECRET) as
                | string
                | { userId: number; iat: number; exp: number };
            if (typeof decoded === 'string') {
                data = JSON.parse(decoded);
            } else {
                data = decoded;
            }
        } catch (e) {
            throw new AppError('forbidden');
        }
        const user = await getRepository(User).findOne({ where: { id: data.userId } });
        if (userType !== undefined && (user === undefined || user.type < userType)) {
            throw new AppError('forbidden');
        }
        req.user = user;
        next();
    };
}
