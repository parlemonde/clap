'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';

import { getCurrentUser } from '../get-current-user';
import { db } from 'src/database';
import { users } from 'src/database/schemas/users';

export async function deleteUser() {
    const user = await getCurrentUser();

    if (!user) {
        return;
    }

    await db.delete(users).where(eq(users.id, user.id));

    const cookieStore = await cookies();
    cookieStore.delete('access-token');

    revalidatePath('/', 'layout');
    redirect(`/`, RedirectType.push);
}

export async function deleteUserById(id: number) {
    const user = await getCurrentUser();

    if (!user || user.role !== 'admin') {
        return;
    }

    await db.delete(users).where(eq(users.id, id));
    revalidatePath('/admin/users');
}
