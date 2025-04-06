'use server';
import { hash, verify } from '@node-rs/argon2';
import { eq, and, lt } from 'drizzle-orm';

import { db } from 'src/database';
import { users } from 'src/database/schemas/users';

export async function updateUserPassword(email: string, verifyToken: string, newPassword: string): Promise<boolean> {
    const user = (
        await db
            .select({
                verificationHash: users.verificationHash,
            })
            .from(users)
            .where(and(eq(users.email, email), lt(users.accountRegistration, 10)))
    )[0];
    if (!user || !user.verificationHash) {
        return false;
    }
    let isTokenCorrect: boolean = false;
    try {
        isTokenCorrect = await verify((user.verificationHash || '').trim(), verifyToken);
    } catch {
        return false;
    }
    if (!isTokenCorrect) {
        return false;
    }
    const passwordHash = await hash(newPassword);
    await db
        .update(users)
        .set({
            passwordHash,
            verificationHash: null,
            accountRegistration: 0, // Reset account registration
        })
        .where(eq(users.email, email));
    return true;
}
