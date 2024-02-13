'use server';

import * as argon2 from 'argon2';
import { sql, or, eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { RedirectType, redirect } from 'next/navigation';

import { db } from 'src/database';
import { users } from 'src/database/schema/users';

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
    const username = getString(formData.get('username'));
    const password = getString(formData.get('password'));

    const userResults = await db
        .select()
        .from(users)
        .where(or(eq(users.email, username), eq(users.name, username)))
        .limit(1);
    const user = userResults[0];

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
        isPasswordCorrect = await argon2.verify(user.passwordHash || '', password);
    } catch (e) {
        return 'Unauthorized - Invalid credentials.';
    }

    if (!isPasswordCorrect) {
        await db.execute(sql`UPDATE ${users} SET \`accountRegistration\` = ${user.accountRegistration + 1} WHERE ${users.id} = ${user.id}`);
        return 'Unauthorized - Invalid credentials.';
    } else if (user.accountRegistration > 0 && user.accountRegistration < 4) {
        await db.execute(sql`UPDATE ${users} SET \`accountRegistration\` = ${0} WHERE ${users.id} = ${user.id}`);
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

    redirect(`/`, RedirectType.push);
}
