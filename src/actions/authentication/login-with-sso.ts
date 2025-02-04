'use server';

import { SignJWT } from 'jose';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { RedirectType, redirect } from 'next/navigation';

import { getPlmUser } from '../legacy-plm/get-plm-user';

const APP_SECRET = new TextEncoder().encode(process.env.APP_SECRET || '');

function getAccessToken(userId: number): Promise<string> {
    return new SignJWT({ userId }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(APP_SECRET);
}

export async function loginWithSSO(code: string): Promise<string> {
    const user = await getPlmUser(code);

    if (!user) {
        return 'Could not connect with SSO.';
    }

    const accessToken = await getAccessToken(user.id);
    const cookieStore = await cookies();
    cookieStore.set({
        name: 'access-token',
        value: accessToken,
        httpOnly: true,
        secure: true,
        maxAge: 604800, // 7 days
        expires: new Date(Date.now() + 604800000),
        sameSite: 'strict',
    });

    revalidatePath('/', 'layout');
    redirect(`/`, RedirectType.push);
}
