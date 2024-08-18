import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { cache } from 'react';

import { db } from 'src/database';
import type { User } from 'src/database/schemas/users';
import { users } from 'src/database/schemas/users';

const APP_SECRET: string = process.env.APP_SECRET || '';

const getUser = cache(async (accessToken: string): Promise<User | undefined> => {
    try {
        let data: { userId: number; iat: number; exp: number };
        const decoded: string | { userId: number; iat: number; exp: number } = jwt.verify(accessToken, APP_SECRET) as
            | string
            | { userId: number; iat: number; exp: number };
        if (typeof decoded === 'string') {
            // TODO: check the type of the decoded data
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            data = JSON.parse(decoded);
        } else {
            data = decoded;
        }
        return await db.query.users.findFirst({
            columns: { id: true, name: true, email: true, role: true },
            where: eq(users.id, data.userId),
        });
    } catch {
        // do nothing
    }
});

export async function getCurrentUser(): Promise<User | undefined> {
    const accessToken = cookies().get('access-token')?.value;
    if (!accessToken) {
        return;
    }
    return getUser(accessToken);
}
