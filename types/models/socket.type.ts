import type { QuestionStatus } from './question.type';

export type AlertTeacherData = {
    projectId: number;
    sequencyId: number;
    sequencyOrder: number;
    status: QuestionStatus;
};

export type AlertStudentData = {
    room: string;
    feedback?: string | null;
    projectId: number;
};
