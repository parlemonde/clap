'use server';

import { eq, and } from 'drizzle-orm';

import { getCurrentUser } from '../get-current-user';
import { db } from 'src/database/database';
import { projects } from 'src/database/schemas/projects';

export async function endCollaboration(projectId: number) {
    const user = await getCurrentUser();
    if (!user) {
        return;
    }

    const project = await db.query.projects.findFirst({
        where: and(eq(projects.id, projectId), eq(projects.userId, user.id)),
    });

    if (!project) {
        return;
    }

    await db.update(projects).set({ collaborationCode: null, collaborationCodeExpiresAt: null }).where(eq(projects.id, projectId));
}
