import { trace } from '@opentelemetry/api';
import { headers } from 'next/headers';

import type { User, UserRole } from '@server/database/schemas/users';

import { auth } from './auth';
import { getActiveStudentCollaborationSessionData, STUDENT_COLLABORATION_USER_EMAIL } from './student-collaboration-session';

const isValidUserRole = (role: string | null | undefined): role is UserRole => {
    return role === 'admin' || role === 'teacher' || role === 'student';
};

const tracer = trace.getTracer('auth');

export const getCurrentUser = async (): Promise<User | undefined> => {
    return tracer.startActiveSpan('getCurrentUser', async (span): Promise<User | undefined> => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session) {
            return undefined;
        }

        const userRole = isValidUserRole(session.user.role) ? session.user.role : 'teacher';
        const sessionData = await getActiveStudentCollaborationSessionData(session.session.data);

        if (sessionData) {
            span.setAttributes({
                'user.id': 'temporary-student',
                'user.email': '',
                'user.name': 'student',
            });

            return {
                ...session.user,
                role: 'student',
                projectId: sessionData.projectId,
                questionId: sessionData.questionId,
                teacherId: sessionData.teacherId,
            };
        }

        if (session.user.email === STUDENT_COLLABORATION_USER_EMAIL || userRole === 'student') {
            return undefined;
        }

        span.setAttributes({
            'user.id': session.user.id,
            'user.email': session.user.email,
            'user.name': session.user.name,
        });

        return { ...session.user, role: userRole };
    });
};
