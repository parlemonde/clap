'use server';

import { db } from '@server/database';
import { inviteTokens } from '@server/database/schemas/invite-tokens';

import { getCurrentUser } from '@server-actions/get-current-user';

import { generateToken } from './generate-token';

export async function inviteUser(): Promise<string | null> {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
        return null;
    }

    const token = generateToken(20);
    await db.insert(inviteTokens).values({
        token,
    });
    return token;
}
