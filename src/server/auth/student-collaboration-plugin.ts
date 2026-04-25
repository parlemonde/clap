import type { BetterAuthPlugin } from 'better-auth';
import { APIError, createAuthEndpoint } from 'better-auth/api';
import { setSessionCookie } from 'better-auth/cookies';
import { and, eq, isNull } from 'drizzle-orm';

import { db } from '@server/database';
import { projects } from '@server/database/schemas/projects';
import { users } from '@server/database/schemas/users';

import { serializeStudentCollaborationSessionData, STUDENT_COLLABORATION_USER_EMAIL } from './student-collaboration-session';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const getBodyString = (body: unknown, key: string): string | undefined => {
    if (!isRecord(body)) {
        return undefined;
    }
    const value = body[key];
    return typeof value === 'string' ? value : undefined;
};

const getBodyNumber = (body: unknown, key: string): number | undefined => {
    if (!isRecord(body)) {
        return undefined;
    }
    const value = body[key];
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value === 'string' && value.trim() !== '') {
        return Number(value);
    }
    return undefined;
};

const ensureStudentCollaborationUser = async () => {
    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, STUDENT_COLLABORATION_USER_EMAIL),
    });
    if (existingUser) {
        return existingUser;
    }

    try {
        const [newUser] = await db
            .insert(users)
            .values({
                email: STUDENT_COLLABORATION_USER_EMAIL,
                emailVerified: true,
                name: 'Student collaboration',
                role: 'student',
            })
            .returning();

        return newUser;
    } catch (error) {
        const createdByConcurrentRequest = await db.query.users.findFirst({
            where: eq(users.email, STUDENT_COLLABORATION_USER_EMAIL),
        });
        if (createdByConcurrentRequest) {
            return createdByConcurrentRequest;
        }
        throw error;
    }
};

export const studentCollaborationPlugin = {
    id: 'student-collaboration',
    endpoints: {
        signInStudentCollaboration: createAuthEndpoint(
            '/sign-in/student-collaboration',
            {
                method: 'POST',
                metadata: {
                    $Infer: {
                        body: {} as {
                            code: string;
                            questionId: number;
                        },
                    },
                },
            },
            async (ctx) => {
                const code = getBodyString(ctx.body as unknown, 'code')?.trim();
                const questionId = getBodyNumber(ctx.body as unknown, 'questionId');

                if (!code || !/^\d{6}$/.test(code) || questionId === undefined || !Number.isInteger(questionId)) {
                    throw APIError.fromStatus('BAD_REQUEST', {
                        message: 'Invalid collaboration credentials',
                    });
                }

                const project = await db.query.projects.findFirst({
                    columns: {
                        collaborationCode: true,
                        collaborationCodeExpiresAt: true,
                        data: true,
                        deleteDate: true,
                        id: true,
                        userId: true,
                    },
                    where: and(eq(projects.collaborationCode, code), isNull(projects.deleteDate)),
                });

                if (
                    !project ||
                    !project.collaborationCodeExpiresAt ||
                    project.collaborationCodeExpiresAt.getTime() <= Date.now() ||
                    !project.data.questions.some((question) => question.id === questionId)
                ) {
                    throw APIError.fromStatus('UNAUTHORIZED', {
                        message: 'Invalid collaboration credentials',
                    });
                }

                const user = await ensureStudentCollaborationUser();
                const sessionData = serializeStudentCollaborationSessionData({
                    expiresAt: project.collaborationCodeExpiresAt.toISOString(),
                    projectId: project.id,
                    questionId,
                    teacherId: project.userId,
                });
                const session = await ctx.context.internalAdapter.createSession(
                    user.id,
                    false,
                    {
                        data: sessionData,
                        expiresAt: project.collaborationCodeExpiresAt,
                    },
                    true,
                );

                if (!session) {
                    throw APIError.fromStatus('INTERNAL_SERVER_ERROR', {
                        message: 'Failed to create collaboration session',
                    });
                }

                await setSessionCookie(ctx, {
                    session,
                    user,
                });

                return ctx.json({
                    success: true,
                });
            },
        ),
    },
    schema: {
        session: {
            fields: {
                data: {
                    fieldName: 'data',
                    input: false,
                    required: false,
                    type: 'string',
                },
            },
        },
    },
} satisfies BetterAuthPlugin;
