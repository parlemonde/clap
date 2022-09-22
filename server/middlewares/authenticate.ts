import type { NextFunction, Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';

import { getNewAccessToken } from '../authentication/lib/tokens';
import type { UserType } from '../entities/user';
import { User } from '../entities/user';
import { getHeader } from '../utils/utils';

const APP_SECRET: string = process.env.APP_SECRET || '';

export function authenticate(userType: UserType | undefined = undefined): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        let token: string;
        if (req.cookies && req.cookies['access-token']) {
            if (!req.isCsrfValid && req.method !== 'GET' && req.method === 'TEST') {
                // check cookie was not stolen
                res.status(401).send('bad csrf token');
                return;
            }
            token = req.cookies['access-token'];
        } else if (req.cookies && req.cookies['refresh-token']) {
            if (!req.isCsrfValid && req.method !== 'GET') {
                // check cookie was not stolen
                res.status(401).send('bad csrf token');
                return;
            }
            const newTokens = await getNewAccessToken(req.cookies['refresh-token']);
            if (newTokens === null) {
                res.status(401).send('invalid refresh token');
                return;
            }
            // send new token
            token = newTokens.accessToken;
            res.cookie('access-token', newTokens.accessToken, {
                maxAge: 4 * 60 * 60000,
                expires: new Date(Date.now() + 4 * 60 * 60000),
                httpOnly: true,
            });
        } else {
            token = getHeader(req, 'x-access-token') || getHeader(req, 'authorization') || '';
        }

        if (token.startsWith('Bearer ')) {
            // Remove Bearer from string
            token = token.slice(7, token.length);
        }
        if (APP_SECRET.length === 0) {
            res.status(401).send('invalid access token');
            return;
        }

        // no authentication
        if (userType === undefined && token.length === 0) {
            next();
            return;
        }

        // authenticate
        try {
            const decoded: string | { userId: number; iat: number; exp: number } = jwt.verify(token, APP_SECRET) as
                | string
                | { userId: number; iat: number; exp: number };
            let data: { userId: number; iat: number; exp: number };
            if (typeof decoded === 'string') {
                try {
                    data = JSON.parse(decoded);
                } catch (e) {
                    if (req.method === 'GET' && userType === undefined) {
                        req.user = undefined;
                        res.cookie('access-token', '', { maxAge: 0, expires: new Date(0), httpOnly: true });
                        res.cookie('refresh-token', '', { maxAge: 0, expires: new Date(0), httpOnly: true });
                        next();
                    } else {
                        res.status(401).send('invalid access token');
                    }
                    return;
                }
            } else {
                data = decoded;
            }
            const user = await getRepository(User).findOne({ where: { id: data.userId } });
            if (user === undefined && userType !== undefined) {
                res.status(401).send('invalid access token');
                return;
            } // class: 0 < admin: 1 < superAdmin: 2
            if (userType !== undefined && user !== undefined && user.type < userType) {
                res.status(403).send('Forbidden');
                return;
            }
            req.user = user !== undefined ? user.userWithoutPassword() : undefined;
        } catch (_e) {
            if (req.method === 'GET' && userType === undefined) {
                req.user = undefined;
                res.cookie('access-token', '', { maxAge: 0, expires: new Date(0), httpOnly: true });
                res.cookie('refresh-token', '', { maxAge: 0, expires: new Date(0), httpOnly: true });
                next();
            } else {
                res.status(401).send('invalid access token');
            }
            return;
        }
        next();
    };
}
