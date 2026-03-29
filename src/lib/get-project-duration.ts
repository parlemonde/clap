import type { Sequence } from 'src/database/schemas/projects';

import { getSequenceDuration } from './get-sequence-duration';

export const getProjectDuration = (questions: Sequence[]): number => {
    return questions.reduce<number>((duration, question) => duration + getSequenceDuration(question), 0);
};
