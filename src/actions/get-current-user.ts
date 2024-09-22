import { eq } from 'drizzle-orm';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { cache } from 'react';

import { db } from 'src/database';
import type { User } from 'src/database/schemas/users';
import { users } from 'src/database/schemas/users';

const APP_SECRET = new TextEncoder().encode(process.env.APP_SECRET || '');

const getUser = cache(async (accessToken: string): Promise<User | undefined> => {
    try {
        const { payload } = await jwtVerify<{ userId: number }>(accessToken, APP_SECRET);
        return await db.query.users.findFirst({
            columns: { id: true, name: true, email: true, role: true },
            where: eq(users.id, payload.userId),
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
