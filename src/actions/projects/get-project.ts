'use server';

import { and, eq } from 'drizzle-orm';

import { getCurrentUser } from '../get-current-user';
import { db } from 'src/database';
import { projects, type Project } from 'src/database/schemas/projects';

export async function getProject(id: number): Promise<Project | undefined> {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return undefined;
    }

    try {
        return await db.query.projects.findFirst({
            where: and(eq(projects.id, id), eq(projects.userId, currentUser.id)),
        });
    } catch (error) {
        console.error(error);
        return undefined;
    }
}
