import Tokens from 'csrf';
import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { getHeader } from '../utils/get-header';

export function crsfProtection(): RequestHandler {
    const tokens = new Tokens();

    return (req: Request, res: Response, next: NextFunction) => {
        // get secret from cookie or create it.
        let secret: string | null = req.cookies?.['csrf-secret'] || null;
        if (secret === null) {
            secret = tokens.secretSync();
            // save new secret in cookie for 2 hours.
            res.cookie('csrf-secret', secret, { expires: new Date(Date.now() + 120 * 60000), httpOnly: true });
        }

        // get token from header ['csrf-token'] or set it to null;
        const token = getHeader(req, 'csrf-token');

        // return either the not null token or a new token based on the secret.
        req.getCsrfToken = () => {
            return token && secret !== null && tokens.verify(secret, token) ? token : tokens.create(secret || '');
        };

        // check csrf
        req.isCsrfValid = token !== undefined && tokens.verify(secret, token);

        // always go next. Invalid csrf are checked at authenticate method.
        next();
    };
}
