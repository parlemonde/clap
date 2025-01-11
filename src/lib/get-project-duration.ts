import { getSequenceDuration } from './get-sequence-duration';
import type { Sequence } from './project.types';

export const getProjectDuration = (questions: Sequence[]): number => {
    return questions.reduce<number>((duration, question) => duration + getSequenceDuration(question), 0);
};
