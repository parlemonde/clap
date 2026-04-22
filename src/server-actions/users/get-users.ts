'use server';

import { ne } from 'drizzle-orm';

import { getCurrentUser } from '@server/auth/get-current-user';
import { STUDENT_COLLABORATION_USER_EMAIL } from '@server/auth/student-collaboration-session';
import { db } from '@server/database';
import { users, type User } from '@server/database/schemas/users';

export async function getUsers(): Promise<User[]> {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        return [];
    }
    return db.select().from(users).where(ne(users.email, STUDENT_COLLABORATION_USER_EMAIL)).orderBy(users.name);
}
