'use server';

import { headers } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';

import { getAuth } from '@server/auth/auth';

export async function logout(redirectTo?: string) {
    await getAuth().api.signOut({ headers: await headers() });
    redirect(`${redirectTo || '/'}`, RedirectType.push);
}
