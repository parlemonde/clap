'use server';

import { cookies } from 'next/headers';
import { RedirectType, redirect } from 'next/navigation';

export async function logout() {
    cookies().delete('access-token');

    redirect(`/`, RedirectType.push);
}
