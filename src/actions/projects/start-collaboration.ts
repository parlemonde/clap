'use server';

import crypto from 'crypto';
import { and, eq } from 'drizzle-orm';

import { getCurrentUser } from '../get-current-user';
import { db } from 'src/database/database';
import { projects } from 'src/database/schemas/projects';

export async function startCollaboration(projectId: number) {
    const user = await getCurrentUser();
    if (!user) {
        return 0;
    }

    const project = await db.query.projects.findFirst({
        columns: {
            id: true,
        },
        where: and(eq(projects.id, projectId), eq(projects.userId, user.id)),
    });

    if (!project) {
        return 0;
    }

    const collaborationCode = `${crypto.randomInt(100000, 999999)}`;
    const collaborationCodeExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(); // 1 jour

    await db.update(projects).set({ collaborationCode, collaborationCodeExpiresAt }).where(eq(projects.id, projectId));
}
