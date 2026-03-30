'use server';

import { eq, and } from 'drizzle-orm';

import { db } from '@server/database/database';
import { projects } from '@server/database/schemas/projects';

import { getCurrentUser } from '@server-actions/get-current-user';

export async function endCollaboration(projectId: number) {
    const user = await getCurrentUser();
    if (!user) {
        return;
    }

    await db
        .update(projects)
        .set({ collaborationCode: null, collaborationCodeExpiresAt: null })
        .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)));
}
