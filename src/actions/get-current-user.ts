'use server';

import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { cache } from 'react';

import { db } from 'src/database';
import { users } from 'src/database/schema/users';

const APP_SECRET: string = process.env.APP_SECRET || '';

export const getCurrentUser = cache(async () => {
    const accessToken = cookies().get('access-token')?.value || '';

    if (!accessToken.length) {
        return null;
    }

    try {
        let data: { userId: number; iat: number; exp: number };
        const decoded: string | { userId: number; iat: number; exp: number } = jwt.verify(accessToken, APP_SECRET) as
            | string
            | { userId: number; iat: number; exp: number };
        if (typeof decoded === 'string') {
            data = JSON.parse(decoded);
        } else {
            data = decoded;
        }

        const results = await db
            .select({ id: users.id, name: users.name, email: users.email, isAdmin: users.isAdmin })
            .from(users)
            .where(eq(users.id, data.userId))
            .limit(1);
        if (results.length === 1) {
            return results[0];
        }
    } catch (e) {
        // do nothing
    }

    return null;
});
