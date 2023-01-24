import type { NextFunction, Request, Response } from 'express';

export function jsonify(_: Request, res: Response, next: NextFunction): void {
    res.sendJSON = (object: unknown, statusCode: number = 200): void => {
        res.setHeader('Content-Type', 'application/json');
        res.status(statusCode).json(object);
    };
    next();
}
