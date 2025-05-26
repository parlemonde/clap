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
    const maybeUser = await db.query.users.findFirst({
        columns: { id: true, name: true, email: true, role: true, accountRegistration: true },
        where: eq(users.id, userId),
    });
    if (!maybeUser) {
        return undefined;
    }
    const { accountRegistration, ...user } = maybeUser;
    return {
        ...user,
        useSSO: accountRegistration === 10,
    };
});

const getUserByProjectId = cache(async (projectId: number, questionId: number): Promise<User | undefined> => {
    const project = await db.query.projects.findFirst({
        columns: { id: true, collaborationCodeExpiresAt: true, userId: true },
        where: eq(projects.id, projectId),
    });
    if (project && project.collaborationCodeExpiresAt !== null && new Date(project.collaborationCodeExpiresAt).getTime() > new Date().getTime()) {
        // Return guest user
        return {
            id: 0,
            teacherId: project.userId,
            name: 'Student',
            role: 'student',
            email: '',
            projectId: project.id,
            questionId,
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
                  questionId: number;
              }
        >(accessToken, APP_SECRET);

        if ('userId' in payload && typeof payload.userId === 'number') {
            return getUserById(payload.userId);
        } else if (
            'projectId' in payload &&
            typeof payload.projectId === 'number' &&
            'questionId' in payload &&
            typeof payload.questionId === 'number'
        ) {
            return getUserByProjectId(payload.projectId, payload.questionId);
        }
    } catch {
        // do nothing
    }
    return undefined;
}
