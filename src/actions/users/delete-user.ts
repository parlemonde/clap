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

    cookies().delete('access-token');

    revalidatePath('/', 'layout');
    redirect(`/`, RedirectType.push);
}
