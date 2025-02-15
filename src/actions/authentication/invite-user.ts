'use server';

import { getCurrentUser } from '../get-current-user';
import { generateToken } from './generate-token';
import { db } from 'src/database';
import { inviteTokens } from 'src/database/schemas/invite-tokens';

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
