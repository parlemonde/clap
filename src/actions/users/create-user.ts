'use server';

import { hash } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

import { getAccessToken } from '../authentication/login';
import { db } from 'src/database';
import { inviteTokens } from 'src/database/schemas/invite-tokens';
import { users } from 'src/database/schemas/users';

export async function isVerifyCodeValid(inviteCode: string): Promise<boolean> {
    const token = (await db.select().from(inviteTokens).where(eq(inviteTokens.token, inviteCode)).limit(1))[0];
    if (!token) {
        return false;
    }
    return new Date(token.createdAt).getTime() >= Date.now() - 628000000000; // 1 month
}

interface CreateUserArgs {
    name: string;
    email: string;
    password: string;
    inviteCode: string;
}
export async function createUser({ name, email, password, inviteCode }: CreateUserArgs): Promise<string> {
    if (!(await isVerifyCodeValid(inviteCode))) {
        return 'Invalid invite code';
    }

    try {
        // Create the user
        const passwordHash = await hash(password);
        const user = (
            await db
                .insert(users)
                .values({
                    name,
                    email,
                    passwordHash,
                })
                .returning({ id: users.id })
        )[0];

        // Delete the invite token
        await db.delete(inviteTokens).where(eq(inviteTokens.token, inviteCode));

        // Log the user in
        const accessToken = await getAccessToken(user.id);
        const cookieStore = await cookies();
        cookieStore.set({
            name: 'access-token',
            value: accessToken,
            httpOnly: true,
            secure: true,
            expires: new Date(Date.now() + 604800000),
            sameSite: 'strict',
        });
        return '';
    } catch (e) {
        console.error(e);
        return "Couldn't create user";
    }
}
