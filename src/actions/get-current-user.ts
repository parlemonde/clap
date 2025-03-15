'use server';

import { eq } from 'drizzle-orm';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { cache } from 'react';

import { db } from 'src/database';
import { projects } from 'src/database/schemas/projects';
import type { User } from 'src/database/schemas/users';
import { users } from 'src/database/schemas/users';

const APP_SECRET = new TextEncoder().encode(process.env.APP_SECRET || '');

const getUserById = cache(async (userId: number): Promise<User | undefined> => {
    return await db.query.users.findFirst({
        columns: { id: true, name: true, email: true, role: true },
        where: eq(users.id, userId),
    });
});

const getUserByProjectId = cache(async (projectId: number): Promise<User | undefined> => {
    const project = await db.query.projects.findFirst({
        columns: { id: true, collaborationCodeExpiresAt: true },
        where: eq(projects.id, projectId),
    });
    if (project && project.collaborationCodeExpiresAt !== null && new Date(project.collaborationCodeExpiresAt).getTime() > new Date().getTime()) {
        // Return guest user
        return {
            id: 0,
            name: 'Student',
            role: 'student',
            email: '',
            projectId: project.id,
        };
    }
    return undefined;
});

export async function getCurrentUser(): Promise<User | undefined> {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access-token')?.value;
    if (!accessToken) {
        return undefined;
    }

    try {
        const { payload } = await jwtVerify<
            | {
                  userId: number;
              }
            | {
                  projectId: number;
              }
        >(accessToken, APP_SECRET);

        if ('userId' in payload && typeof payload.userId === 'number') {
            return getUserById(payload.userId);
        } else if ('projectId' in payload && typeof payload.projectId === 'number') {
            return getUserByProjectId(payload.projectId);
        }
    } catch {
        // do nothing
    }
    return undefined;
}
