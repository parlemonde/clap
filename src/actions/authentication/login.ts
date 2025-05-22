'use server';

import { verify } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';

import { db } from 'src/database';
import { users } from 'src/database/schemas/users';

const APP_SECRET = new TextEncoder().encode(process.env.APP_SECRET || '');

type LoginData =
    | {
          userId: number;
      }
    | {
          projectId: number; // student guest login
          questionId: number;
      };
export async function getAccessToken(loginData: LoginData): Promise<string> {
    return new SignJWT(loginData).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(APP_SECRET);
}

const getString = (value: unknown): string => {
    if (typeof value === 'string') {
        return value;
    }
    return '';
};

export async function login(_previousState: string, formData: FormData): Promise<string> {
    const email = getString(formData.get('email'));
    const password = getString(formData.get('password'));

    const user = await db.query.users.findFirst({
        columns: { id: true, passwordHash: true, accountRegistration: true },
        where: eq(users.email, email),
    });

    if (!user) {
        return 'common.errors.invalid_credentials';
    }
    if (user.accountRegistration === 4) {
        return 'common.errors.account_blocked';
    }
    if (user.accountRegistration === 10) {
        return 'common.errors.sso_connection_required';
    }

    let isPasswordCorrect: boolean = false;
    try {
        isPasswordCorrect = await verify((user.passwordHash || '').trim(), password);
    } catch {
        return 'common.errors.invalid_credentials';
    }

    if (!isPasswordCorrect) {
        await db
            .update(users)
            .set({
                accountRegistration: Math.min(user.accountRegistration + 1, 4), // Max 4 attempts
            })
            .where(eq(users.id, user.id));
        return 'common.errors.invalid_credentials';
    } else if (user.accountRegistration > 0) {
        await db
            .update(users)
            .set({
                accountRegistration: 0,
            })
            .where(eq(users.id, user.id));
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
