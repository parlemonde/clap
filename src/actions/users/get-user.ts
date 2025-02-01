'use server';

import { eq } from 'drizzle-orm';

import { getCurrentUser } from '../get-current-user';
import { db } from 'src/database';
import { users, type User } from 'src/database/schemas/users';

export async function getUser(userId: number): Promise<User | undefined> {
    const currentUser = await getCurrentUser();
    if (currentUser?.role !== 'admin') {
        throw new Error('Not allowed');
    }
    return db.query.users.findFirst({
        where: eq(users.id, userId),
    });
}
