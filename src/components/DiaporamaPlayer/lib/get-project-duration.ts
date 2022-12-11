import type { Question } from 'types/models/question.type';

export const getProjectDuration = (questions: Question[]): number => {
    return questions.reduce<number>(
        (duration, question) =>
            duration +
            Math.max(0, question.title?.duration || 0) +
            (question.plans || []).reduce<number>((acc, plan) => acc + Math.max(0, plan.duration || 0), 0),
        0,
    );
};
