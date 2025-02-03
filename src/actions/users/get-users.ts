'use server';

import { getCurrentUser } from '../get-current-user';
import { db } from 'src/database';
import { users, type User } from 'src/database/schemas/users';

export async function getUsers(): Promise<User[]> {
    const currentUser = await getCurrentUser();
    if (currentUser?.role !== 'admin') {
        throw new Error('Not allowed');
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
