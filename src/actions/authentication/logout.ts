'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { RedirectType, redirect } from 'next/navigation';

export async function logout() {
    cookies().delete('access-token');

    revalidatePath('/', 'layout');
    redirect(`/`, RedirectType.push);
}
