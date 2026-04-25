'use server';

import { getCurrentUser } from '@server/auth/get-current-user';
import { db } from '@server/database';
import { projects, type NewProject, type Project } from '@server/database/schemas/projects';

export async function createProject(project: NewProject): Promise<Project | undefined> {
    const user = await getCurrentUser();
    if (!user) {
        return;
    }
    const newProjects = await db
        .insert(projects)
        .values({ ...project, userId: user.id })
        .returning();
    return newProjects[0];
}
