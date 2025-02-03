'use server';
import * as argon2 from 'argon2';
import { eq } from 'drizzle-orm';

import { db } from 'src/database';
import { users } from 'src/database/schemas/users';

export async function updateUserPassword(email: string, verifyToken: string, newPassword: string) {
    const user = (
        await db
            .select({
                verificationHash: users.verificationHash,
            })
            .from(users)
            .where(eq(users.email, email))
    )[0];
    if (!user || !user.verificationHash) {
        return false;
    }
    let isTokenCorrect: boolean = false;
    try {
        isTokenCorrect = await argon2.verify((user.verificationHash || '').trim(), verifyToken);
    } catch {
        return false;
    }
    if (!isTokenCorrect) {
        return false;
    }
    const passwordHash = await argon2.hash(newPassword);
    await db
        .update(users)
        .set({
            passwordHash,
            verificationHash: null,
        })
        .where(eq(users.email, email));
    return true;
}
