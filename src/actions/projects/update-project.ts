'use server';

import { and, eq } from 'drizzle-orm';

import { getCurrentUser } from '../get-current-user';
import { db } from 'src/database';
import { projects, type Project } from 'src/database/schemas/projects';

export async function updateProject(projectId: number, updatedProject: Partial<Project>): Promise<void> {
    const user = await getCurrentUser();

    if (!user) {
        return;
    }

    try {
        await db
            .update(projects)
            .set(updatedProject)
            .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)));
    } catch (error) {
        console.error(error);
    }
}
