import type { RequestHandler, NextFunction, Request, Response } from 'express';

import { logger } from '../lib/logger';

const ERRORS = {
    badRequest: { httpCode: 400, msg: 'Bad request' },
    forbidden: { httpCode: 403, msg: 'Access forbidden' },
    loginError: { httpCode: 401, msg: 'Unauthorized' },
    unknown: { httpCode: 500, msg: 'An unknown error happened' },
};
export type APP_ERRORS = keyof typeof ERRORS;

export class AppError extends Error {
    public errorName: APP_ERRORS;
    public errorCode?: number;
    public errorMessages: string[];

    constructor(errorName: APP_ERRORS, errorMessages: string[] = [], errorCode?: number) {
        super();
        this.errorName = errorName;
        this.errorMessages = errorMessages;
        this.errorCode = errorCode;
    }
}

export function handleErrors(fn: RequestHandler): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
        const sendError = (err: Error | AppError): void => {
            const errorMessages: string[] = [];
            let errorCode: number | undefined = undefined;
            let httpStatusCode: number;
            if (err instanceof AppError) {
                if (err.errorMessages.length > 0) {
                    errorMessages.push(...err.errorMessages);
                } else {
                    errorMessages.push(ERRORS[err.errorName].msg);
                }
                errorCode = err.errorCode;
                httpStatusCode = ERRORS[err.errorName].httpCode;
            } else {
                logger.error(err.message);
                logger.error(JSON.stringify(err.stack));
                errorMessages.push(ERRORS.unknown.msg);
                httpStatusCode = ERRORS.unknown.httpCode;
            }

            // in case of forbidden requests, clean cookies.
            if (httpStatusCode === 401 || httpStatusCode === 403) {
                res.cookie('access-token', '', { maxAge: 0, expires: new Date(0), httpOnly: true, secure: true, sameSite: 'strict' });
                res.cookie('refresh-token', '', { maxAge: 0, expires: new Date(0), httpOnly: true, secure: true, sameSite: 'strict' });
            }
            res.setHeader('Content-Type', 'application/json');
            res.sendJSON({ errors: errorMessages, errorCode }, httpStatusCode);
        };

        try {
            Promise.resolve(fn(req, res, next)).catch(sendError);
        } catch (err) {
            sendError(err as Error);
        }
    };
}
