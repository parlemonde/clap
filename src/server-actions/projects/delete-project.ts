'use server';

import { and, eq } from 'drizzle-orm';

import { db } from '@server/database';
import { projects } from '@server/database/schemas/projects';

import { getCurrentUser } from '@server-actions/get-current-user';

export async function deleteProject(id: number): Promise<void> {
    const user = await getCurrentUser();
    if (!user) {
        return undefined;
    }

    await db.delete(projects).where(and(eq(projects.id, id), eq(projects.userId, user.id)));
}
