'use server';

import { eq } from 'drizzle-orm';

import { getCurrentUser } from '../get-current-user';
import { db } from 'src/database';
import { projects, type Project } from 'src/database/schemas/projects';

export async function getProjects(): Promise<Project[]> {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return [];
    }

    try {
        return await db.query.projects.findMany({
            where: eq(projects.userId, currentUser.id),
        });
    } catch (error) {
        console.error(error);
        return [];
    }
}
