'use server';

import { getCurrentUser } from '@server/auth/get-current-user';
import { db } from '@server/database';
import { users, type User } from '@server/database/schemas/users';

export async function getUsers(): Promise<User[]> {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        return [];
    }
    return db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
        })
        .from(users)
        .orderBy(users.name);
}
