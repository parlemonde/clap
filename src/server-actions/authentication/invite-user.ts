'use server';

import { getCurrentUser } from '@server/auth/get-current-user';
import { generateInviteToken } from '@server/auth/invite-token';

export async function inviteUser(): Promise<string | null> {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
        return null;
    }
    return generateInviteToken();
}
