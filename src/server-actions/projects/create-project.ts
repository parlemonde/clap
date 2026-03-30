'use server';

import { db } from '@server/database';
import { projects, type NewProject, type Project } from '@server/database/schemas/projects';

import { getCurrentUser } from '@server-actions/get-current-user';

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
