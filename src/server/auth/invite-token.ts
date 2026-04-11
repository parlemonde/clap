import { createRandomStringGenerator } from '@better-auth/utils/random';
import { eq, and } from 'drizzle-orm';

import { db } from '@server/database';
import { auth_verifications as authVerifications } from '@server/database/schemas/auth-schemas';

const generateToken = createRandomStringGenerator('a-z', 'A-Z', '0-9');

export async function generateInviteToken(): Promise<string> {
    const invitationToken = generateToken(16);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // expires in 1 month
    await db.insert(authVerifications).values([
        {
            identifier: `invite-token`,
            value: invitationToken,
            expiresAt,
        },
    ]);
    return invitationToken;
}

export async function isInviteTokenValid(inviteCode: string): Promise<boolean> {
    const token = (
        await db
            .select()
            .from(authVerifications)
            .where(and(eq(authVerifications.identifier, 'invite-token'), eq(authVerifications.value, inviteCode)))
            .limit(1)
    )[0];
    if (!token) {
        return false;
    }
    return token.expiresAt.getTime() >= Date.now();
}
