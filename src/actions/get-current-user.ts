'use server';

import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { cookies, headers } from 'next/headers';
import { cache } from 'react';

import { db } from 'src/database';
import { users } from 'src/database/schema/users';

const APP_SECRET: string = process.env.APP_SECRET || '';

export const getCurrentUser = cache(async () => {
    let accessToken = cookies().get('access-token')?.value || headers().get('authorization') || '';
    if (accessToken.startsWith('Bearer ')) {
        // Remove Bearer from string
        accessToken = accessToken.slice(7, accessToken.length);
    }

    if (accessToken.length === 0) {
        return null;
    }

    let data: { userId: number; iat: number; exp: number };
    try {
        const decoded: string | { userId: number; iat: number; exp: number } = jwt.verify(accessToken, APP_SECRET) as
            | string
            | { userId: number; iat: number; exp: number };
        if (typeof decoded === 'string') {
            data = JSON.parse(decoded);
        } else {
            data = decoded;
        }
    } catch (e) {
        return null;
    }

    const results = await db.select().from(users).where(eq(users.id, data.userId)).limit(1);
    if (results.length === 1) {
        return results[0] || null;
    }
    return null;
});
