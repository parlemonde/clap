'use server';

import { and, eq } from 'drizzle-orm';

import { getCurrentUser } from '../get-current-user';
import { db } from 'src/database';
import { projects } from 'src/database/schemas/projects';

export async function deleteProject(id: number): Promise<void> {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return undefined;
    }

    try {
        await db.delete(projects).where(and(eq(projects.id, id), eq(projects.userId, currentUser.id)));
    } catch (error) {
        console.error(error);
        return undefined;
    }
}
