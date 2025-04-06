'use server';

import { and, eq } from 'drizzle-orm';

import { getCurrentUser } from '../get-current-user';
import { db } from 'src/database';
import { projects } from 'src/database/schemas/projects';

export async function deleteProject(id: number): Promise<void> {
    const user = await getCurrentUser();
    if (!user) {
        return undefined;
    }

    await db.delete(projects).where(and(eq(projects.id, id), eq(projects.userId, user.id)));
}
