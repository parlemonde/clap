'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { RedirectType, redirect } from 'next/navigation';

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('access-token');

    revalidatePath('/', 'layout');
    redirect(`/`, RedirectType.push);
}
