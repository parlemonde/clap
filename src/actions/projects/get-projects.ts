'use server';

import { eq } from 'drizzle-orm';

import { getCurrentUser } from '../get-current-user';
import { db } from 'src/database';
import { projects, type Project } from 'src/database/schemas/projects';

export async function getProjects(): Promise<Project[]> {
    const user = await getCurrentUser();
    if (!user) {
        return [];
    }

    return await db.select().from(projects).where(eq(projects.userId, user.id)).orderBy(projects.createDate);
}
