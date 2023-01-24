import type { Request } from 'express';

/**
 * Returns a simple header value.
 *
 * @param req - Express request
 * @param headerName - The header name
 * @returns the header value
 */
export function getHeader(req: Request, headerName: string): string | undefined {
    const value = req.headers[headerName];
    if (typeof value === 'string') {
        return value;
    } else if (value !== undefined) {
        return value[0] || undefined;
    }
    return undefined;
}
