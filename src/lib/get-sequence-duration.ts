import type { Sequence } from 'src/database/schemas/projects';

export function isSequenceAvailable(sequence: Sequence) {
    return sequence.title !== null || (sequence.plans || []).some((plan) => plan.description || plan.imageUrl);
}

export function getSequenceDuration(sequence: Sequence) {
    if (!isSequenceAvailable(sequence)) {
        return 0;
    }
    return (sequence.title ? sequence.title.duration : 0) + sequence.plans.reduce<number>((acc, plan) => acc + plan.duration, 0);
}
