'use server';

import { db } from 'src/database';
import { projects, type NewProject, type Project } from 'src/database/schemas/projects';

import { getCurrentUser } from '../get-current-user';

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
