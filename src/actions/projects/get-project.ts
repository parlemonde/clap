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

export async function getProjectByCode(code: string): Promise<Project | undefined> {
    try {
        const project = await db.query.projects.findFirst({
            where: eq(projects.collaborationCode, code),
        });
        if (
            !project ||
            project.collaborationCodeExpiresAt === null ||
            new Date(project.collaborationCodeExpiresAt).getTime() < new Date().getTime()
        ) {
            return undefined;
        }
        return project;
    } catch (error) {
        console.error(error);
        return undefined;
    }
}
