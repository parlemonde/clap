'use server';

import { eq } from 'drizzle-orm';

import { db } from '@server/database';
import { users, type User } from '@server/database/schemas/users';

import { getCurrentUser } from '@server-actions/get-current-user';

export async function getUser(userId: number): Promise<User | undefined> {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        return undefined;
    }
    return db.query.users.findFirst({
        columns: { id: true, name: true, email: true, role: true },
        where: eq(users.id, userId),
    });
}
