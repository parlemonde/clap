import type { Sequence } from 'src/database/schemas/projects';

export function isSequenceAvailable(sequence: Sequence) {
    return sequence.title !== null || (sequence.plans || []).some((plan) => plan.description || plan.imageUrl);
}

export function getSequenceDuration(sequence: Sequence) {
    if (!isSequenceAvailable(sequence)) {
        return 0;
    }
    return (
        (sequence.title ? Math.max(1000, sequence.title.duration || 0) : 0) +
        (sequence.plans || []).reduce<number>((acc, plan) => acc + Math.max(1000, plan.duration || 0), 0)
    );
}
