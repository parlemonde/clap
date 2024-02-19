import type { Question } from 'types/models/question.type';

export function isSequenceAvailable(sequence: Question) {
    return sequence.title !== null || (sequence.plans || []).some((plan) => plan.description || plan.imageUrl);
}

export function getSequenceDuration(sequence: Question) {
    if (!isSequenceAvailable(sequence)) {
        return 0;
    }
    return (
        (sequence.title?.duration ? Math.max(1000, sequence.title.duration) : 0) +
        (sequence.plans || []).reduce<number>((acc, plan) => (acc + plan?.duration ? Math.max(1000, plan.duration || 0) : 0), 0)
    );
}
