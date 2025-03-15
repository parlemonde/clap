'use server';

import { cookies } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';

import { getAccessToken } from './login';
import { getPlmUser } from '../legacy-plm/get-plm-user';

export async function loginWithSSO(code: string): Promise<string> {
    const user = await getPlmUser(code);
    if (!user) {
        return 'Could not connect with SSO.';
    }

    const accessToken = await getAccessToken({ userId: user.id });
    const cookieStore = await cookies();
    cookieStore.set({
        name: 'access-token',
        value: accessToken,
        httpOnly: true,
        secure: true,
        expires: new Date(Date.now() + 604800000),
        sameSite: 'strict',
    });
    redirect(`/`, RedirectType.push);
}
