'use server';

import { db } from 'src/database';
import { users, type User } from 'src/database/schemas/users';

import { getCurrentUser } from '../get-current-user';

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
