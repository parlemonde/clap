import { eq, inArray, isNotNull } from 'drizzle-orm';

import { db } from '@server/database';
import { auth_sessions as authSessions } from '@server/database/schemas/auth-schemas';
import { projects } from '@server/database/schemas/projects';

export const STUDENT_COLLABORATION_USER_EMAIL = 'student-collaboration@clap.local';

const STUDENT_COLLABORATION_SESSION_KIND = 'student-collaboration';
const STUDENT_COLLABORATION_SESSION_VERSION = 1;

export interface StudentCollaborationSessionData {
    kind: typeof STUDENT_COLLABORATION_SESSION_KIND;
    version: typeof STUDENT_COLLABORATION_SESSION_VERSION;
    projectId: number;
    questionId: number;
    teacherId: string;
    expiresAt: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

export const serializeStudentCollaborationSessionData = (data: Omit<StudentCollaborationSessionData, 'kind' | 'version'>): string => {
    return JSON.stringify({
        kind: STUDENT_COLLABORATION_SESSION_KIND,
        version: STUDENT_COLLABORATION_SESSION_VERSION,
        ...data,
    });
};

export const parseStudentCollaborationSessionData = (data: string | null | undefined): StudentCollaborationSessionData | undefined => {
    if (!data) {
        return undefined;
    }

    try {
        const parsed = JSON.parse(data) as unknown;
        if (!isRecord(parsed)) {
            return undefined;
        }

        if (
            parsed.kind !== STUDENT_COLLABORATION_SESSION_KIND ||
            parsed.version !== STUDENT_COLLABORATION_SESSION_VERSION ||
            typeof parsed.projectId !== 'number' ||
            typeof parsed.questionId !== 'number' ||
            typeof parsed.teacherId !== 'string' ||
            typeof parsed.expiresAt !== 'string'
        ) {
            return undefined;
        }

        if (!Number.isInteger(parsed.projectId) || !Number.isInteger(parsed.questionId) || Number.isNaN(Date.parse(parsed.expiresAt))) {
            return undefined;
        }

        return {
            expiresAt: parsed.expiresAt,
            kind: STUDENT_COLLABORATION_SESSION_KIND,
            projectId: parsed.projectId,
            questionId: parsed.questionId,
            teacherId: parsed.teacherId,
            version: STUDENT_COLLABORATION_SESSION_VERSION,
        };
    } catch {
        return undefined;
    }
};

export const getActiveStudentCollaborationSessionData = async (
    data: string | null | undefined,
): Promise<StudentCollaborationSessionData | undefined> => {
    const parsedData = parseStudentCollaborationSessionData(data);
    if (!parsedData || new Date(parsedData.expiresAt).getTime() <= Date.now()) {
        return undefined;
    }

    const project = await db.query.projects.findFirst({
        columns: {
            collaborationCode: true,
            collaborationCodeExpiresAt: true,
            data: true,
            id: true,
            userId: true,
        },
        where: eq(projects.id, parsedData.projectId),
    });

    if (
        !project ||
        project.userId !== parsedData.teacherId ||
        !project.collaborationCode ||
        !project.collaborationCodeExpiresAt ||
        project.collaborationCodeExpiresAt.getTime() <= Date.now() ||
        !project.data.questions.some((question) => question.id === parsedData.questionId)
    ) {
        return undefined;
    }

    return parsedData;
};

export const deleteStudentCollaborationSessionsForProject = async (projectId: number): Promise<void> => {
    const collaborationSessions = await db
        .select({
            data: authSessions.data,
            id: authSessions.id,
        })
        .from(authSessions)
        .where(isNotNull(authSessions.data));

    const idsToDelete = collaborationSessions
        .filter((session) => parseStudentCollaborationSessionData(session.data)?.projectId === projectId)
        .map((session) => session.id);

    if (idsToDelete.length === 0) {
        return;
    }

    await db.delete(authSessions).where(inArray(authSessions.id, idsToDelete));
};
