import base64url from 'base64url';
import crypto from 'crypto';
import type { Request } from 'express';
import fs from 'fs';
import QRCode from 'qrcode';

import { logger } from './logger';

/**
 * Pause the program for x milliseconds.
 * @param ms
 */
export function sleep(ms: number): Promise<void> {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

export function getHeader(req: Request, header: string): string | undefined {
    const headers: string | string[] | undefined = req.headers[header];
    if (typeof headers === 'string') {
        return headers;
    } else if (headers !== undefined) {
        return headers[0] || undefined;
    }
    return undefined;
}

export function isPasswordValid(password: string): boolean {
    return (
        password !== undefined &&
        password !== null &&
        password.length >= 8 &&
        /\d+/.test(password) &&
        /[a-z]+/.test(password) &&
        /[A-Z]+/.test(password)
    );
}

export function generateTemporaryToken(length: number): string {
    return base64url(crypto.randomBytes(length)).slice(0, length);
}

export function getBase64File(path: string): string {
    return fs.readFileSync(path).toString('base64');
}

export async function getQRCodeURL(url: string): Promise<string> {
    try {
        return await QRCode.toDataURL(url);
    } catch (err) {
        logger.error('Could not generate QRCode url...');
        logger.error(err);
        return '';
    }
}
