'use server';

import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

import { getAccessToken } from './login';
import { db } from 'src/database';
import { projects } from 'src/database/schemas/projects';

export async function loginForStudent(projectCode: string, questionId: number): Promise<{ errorMessage: string } | { projectId: number }> {
    const project = await db.query.projects.findFirst({
        columns: {
            id: true,
        },
        where: eq(projects.collaborationCode, projectCode),
    });

    if (!project) {
        return { errorMessage: 'join_page.errors.invalid_code' };
    }

    const accessToken = await getAccessToken({ projectId: project.id, questionId });
    const cookieStore = await cookies();
    cookieStore.set({
        name: 'access-token',
        value: accessToken,
        httpOnly: true,
        secure: true,
        expires: new Date(Date.now() + 14400000), // 4h
        sameSite: 'strict',
    });
    return {
        projectId: project.id,
    };
}
