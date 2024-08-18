'use server';

import * as argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { RedirectType, redirect } from 'next/navigation';

import { db } from 'src/database';
import { users } from 'src/database/schemas/users';

const APP_SECRET: string = process.env.APP_SECRET || '';

function getAccessToken(userId: number): string {
    return jwt.sign({ userId }, APP_SECRET, { expiresIn: '7d' });
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
        return 'Unauthorized - Invalid credentials.';
    }
    if (user.accountRegistration === 4) {
        return 'Unauthorized - Account blocked. Please reset password.';
    }
    if (user.accountRegistration === 10) {
        return 'Unauthorized - Please use SSO.';
    }

    let isPasswordCorrect: boolean = false;
    try {
        isPasswordCorrect = await argon2.verify((user.passwordHash || '').trim(), password);
    } catch {
        return 'Unauthorized - Invalid credentials.';
    }

    if (!isPasswordCorrect) {
        await db
            .update(users)
            .set({
                accountRegistration: user.accountRegistration + 1,
            })
            .where(eq(users.id, user.id));
        return 'Unauthorized - Invalid credentials.';
    } else if (user.accountRegistration > 0) {
        await db
            .update(users)
            .set({
                accountRegistration: 0,
            })
            .where(eq(users.id, user.id));
    }

    const accessToken = getAccessToken(user.id);
    cookies().set({
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
