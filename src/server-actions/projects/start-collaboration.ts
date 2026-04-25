'use server';

import crypto from 'crypto';
import { and, eq } from 'drizzle-orm';

import { getCurrentUser } from '@server/auth/get-current-user';
import { db } from '@server/database/database';
import { projects } from '@server/database/schemas/projects';

const createCollaborationCode = async (): Promise<string> => {
    for (let attempt = 0; attempt < 10; attempt++) {
        const collaborationCode = `${crypto.randomInt(100000, 999999)}`;
        const existingProject = await db.query.projects.findFirst({
            columns: {
                id: true,
            },
            where: eq(projects.collaborationCode, collaborationCode),
        });
        if (!existingProject) {
            return collaborationCode;
        }
    }

    throw new Error('Unable to create a unique collaboration code');
};

export async function startCollaboration(projectId: number) {
    const user = await getCurrentUser();
    if (!user) {
        return;
    }

    const project = await db.query.projects.findFirst({
        columns: {
            id: true,
        },
        where: and(eq(projects.id, projectId), eq(projects.userId, user.id)),
    });

    if (!project) {
        return;
    }

    const collaborationCode = await createCollaborationCode();
    const collaborationCodeExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 1 jour

    await db.update(projects).set({ collaborationCode, collaborationCodeExpiresAt }).where(eq(projects.id, projectId));
}
