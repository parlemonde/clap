import base64url from 'base64url';
import crypto from 'crypto';

export function generateToken(length: number): string {
    return base64url(crypto.randomBytes(length)).slice(0, length);
}
