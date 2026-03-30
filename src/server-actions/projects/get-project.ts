'use server';

import { and, eq } from 'drizzle-orm';

import { db } from '@server/database';
import { projects, type Project } from '@server/database/schemas/projects';

import { getCurrentUser } from '@server-actions/get-current-user';

export async function getProject(id: number): Promise<Project | undefined> {
    const user = await getCurrentUser();
    if (!user) {
        return undefined;
    }

    return await db.query.projects.findFirst({
        where: and(eq(projects.id, id), eq(projects.userId, user.id)),
    });
}

export async function getProjectByCode(code: string): Promise<Project | undefined> {
    const project = await db.query.projects.findFirst({
        where: eq(projects.collaborationCode, code),
    });
    if (!project || project.collaborationCodeExpiresAt === null || new Date(project.collaborationCodeExpiresAt).getTime() < new Date().getTime()) {
        return undefined;
    }
    return project;
}
