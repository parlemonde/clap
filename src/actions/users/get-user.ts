'use server';

import { eq } from 'drizzle-orm';
import { db } from 'src/database';
import { users, type User } from 'src/database/schemas/users';

import { getCurrentUser } from '../get-current-user';

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
