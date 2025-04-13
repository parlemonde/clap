import { getSequenceDuration } from './get-sequence-duration';
import type { Sequence } from 'src/database/schemas/projects';

export const getProjectDuration = (questions: Sequence[]): number => {
    return questions.reduce<number>((duration, question) => duration + getSequenceDuration(question), 0);
};
