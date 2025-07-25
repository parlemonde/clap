'use server';

import { hash } from '@node-rs/argon2';
import { eq, and, lt } from 'drizzle-orm';

import { generateToken } from './generate-token';
import { db } from 'src/database';
import { users } from 'src/database/schemas/users';
import { sendMail } from 'src/emails';

const getString = (value: unknown): string => {
    if (typeof value === 'string') {
        return value;
    }
    return '';
};

export async function resetPassword(formData: FormData): Promise<void> {
    const email = getString(formData.get('email'));
    if (!email) {
        return;
    }
    const isUserValid =
        (
            await db
                .select({ id: users.id })
                .from(users)
                .where(and(eq(users.email, email), lt(users.accountRegistration, 10)))
        ).length === 1;
    if (!isUserValid) {
        return;
    }
    const resetCode = generateToken(12);
    const verificationHash = await hash(resetCode);
    await db.update(users).set({ verificationHash }).where(eq(users.email, email));
    try {
        await sendMail(email, {
            kind: 'reset-password',
            data: {
                resetCode,
            },
        });
    } catch (e) {
        console.error(e);
    }
}
