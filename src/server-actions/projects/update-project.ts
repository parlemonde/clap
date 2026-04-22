'use server';

import { and, eq } from 'drizzle-orm';
import isEqual from 'fast-deep-equal/es6';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@server/auth/get-current-user';
import { db } from '@server/database';
import { projects, type Project, type ProjectData, type Sequence } from '@server/database/schemas/projects';

const STUDENT_SEQUENCE_KEYS = new Set([
    'feedbacks',
    'id',
    'plans',
    'question',
    'soundUrl',
    'soundVolume',
    'status',
    'title',
    'voiceOffBeginTime',
    'voiceText',
]);

const isValidStudentSequenceShape = (sequence: Sequence): boolean => {
    return Object.keys(sequence).every((key) => STUDENT_SEQUENCE_KEYS.has(key));
};

const isValidStudentStatusChange = (currentStatus: Sequence['status'], nextStatus: Sequence['status']): boolean => {
    if (currentStatus === nextStatus) {
        return true;
    }

    if ((!currentStatus || currentStatus === 'storyboard') && nextStatus === 'storyboard-validating') {
        return true;
    }

    if (currentStatus === 'pre-mounting' && nextStatus === 'pre-mounting-validating') {
        return true;
    }

    return false;
};

const isValidStudentSequenceUpdate = (currentSequence: Sequence, nextSequence: Sequence): boolean => {
    if (!isValidStudentSequenceShape(nextSequence)) {
        return false;
    }

    if (currentSequence.id !== nextSequence.id || currentSequence.question !== nextSequence.question) {
        return false;
    }

    if (!isEqual(currentSequence.feedbacks, nextSequence.feedbacks)) {
        return false;
    }

    return isValidStudentStatusChange(currentSequence.status, nextSequence.status);
};

const isValidStudentProjectDataUpdate = (currentData: ProjectData, nextData: ProjectData, questionId: number): boolean => {
    const { questions: currentQuestions, ...currentProjectFields } = currentData;
    const { questions: nextQuestions, ...nextProjectFields } = nextData;

    if (!isEqual(currentProjectFields, nextProjectFields) || currentQuestions.length !== nextQuestions.length) {
        return false;
    }

    for (let index = 0; index < currentQuestions.length; index++) {
        const currentQuestion = currentQuestions[index];
        const nextQuestion = nextQuestions[index];

        if (!nextQuestion || currentQuestion.id !== nextQuestion.id) {
            return false;
        }

        if (currentQuestion.id === questionId) {
            if (!isValidStudentSequenceUpdate(currentQuestion, nextQuestion)) {
                return false;
            }
        } else if (!isEqual(currentQuestion, nextQuestion)) {
            return false;
        }
    }

    return true;
};

export async function updateProject(projectId: number, updatedProject: Partial<Project>, revalidatePage?: boolean): Promise<void> {
    const user = await getCurrentUser();

    if (!user) {
        return;
    }

    if (user.role === 'student') {
        if (user.projectId !== projectId || user.questionId === undefined || updatedProject.data === undefined) {
            return;
        }

        const project = await db.query.projects.findFirst({
            columns: {
                collaborationCode: true,
                collaborationCodeExpiresAt: true,
                data: true,
                id: true,
            },
            where: eq(projects.id, projectId),
        });

        if (
            !project ||
            !project.collaborationCode ||
            !project.collaborationCodeExpiresAt ||
            project.collaborationCodeExpiresAt.getTime() <= Date.now() ||
            !isValidStudentProjectDataUpdate(project.data, updatedProject.data, user.questionId)
        ) {
            return;
        }

        await db.update(projects).set({ data: updatedProject.data }).where(eq(projects.id, projectId));
        return;
    }

    await db
        .update(projects)
        .set(updatedProject)
        .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)));
    if (revalidatePage) {
        revalidatePath(`/my-videos/${projectId}`);
    }
}
