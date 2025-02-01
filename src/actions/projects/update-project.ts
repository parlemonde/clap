'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '../get-current-user';
import { db } from 'src/database';
import { projects, type Project } from 'src/database/schemas/projects';

export async function updateProject(projectId: number, updatedProject: Partial<Project>, revalidatePage?: boolean): Promise<void> {
    const user = await getCurrentUser();

    if (!user) {
        return;
    }

    try {
        await db
            .update(projects)
            .set(updatedProject)
            .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)));
        if (revalidatePage) {
            revalidatePath(`/my-videos/${projectId}`);
        }
    } catch (error) {
        console.error(error);
    }
}
