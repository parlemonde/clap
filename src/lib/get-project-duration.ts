import { getSequenceDuration } from './get-sequence-duration';
import type { Question } from 'types/models/question.type';

export const getProjectDuration = (questions: Question[]): number => {
    return questions.reduce<number>((duration, question) => duration + getSequenceDuration(question), 0);
};
