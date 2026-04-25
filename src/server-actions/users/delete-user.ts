'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect, RedirectType } from 'next/navigation';

import { getCurrentUser } from '@server/auth/get-current-user';
import { db } from '@server/database';
import { auth_sessions as authSessions } from '@server/database/schemas/auth-schemas';
import { users } from '@server/database/schemas/users';

export async function deleteUser() {
    const user = await getCurrentUser();
    if (!user) {
        return;
    }
    await db.delete(authSessions).where(eq(authSessions.userId, user.id));
    await db.delete(users).where(eq(users.id, user.id));
    revalidatePath('/', 'layout');
    redirect(`/`, RedirectType.push);
}

export async function deleteUserById(id: string) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        return;
    }
    await db.delete(authSessions).where(eq(authSessions.userId, id));
    await db.delete(users).where(eq(users.id, id));
    revalidatePath('/admin/users');
}
