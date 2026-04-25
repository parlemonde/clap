'use server';

import { headers } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';

import { auth } from '@server/auth/auth';

export async function logout(redirectTo?: string) {
    await auth.api.signOut({ headers: await headers() });
    redirect(`${redirectTo || '/'}`, RedirectType.push);
}
