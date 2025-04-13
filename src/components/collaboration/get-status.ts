import type { Sequence } from 'src/database/schemas/projects';

export function getStatus(status: Sequence['status']) {
    if (!status || status === 'storyboard') {
        return 'En cours - Storyboard';
    }
    if (status === 'storyboard-validating') {
        return 'Soumis pour validation - Storyboard';
    }
    if (status === 'pre-mounting') {
        return 'En cours - Prémontage';
    }
    if (status === 'pre-mounting-validating') {
        return 'Soumis pour validation - Prémontage';
    }
    if (status === 'validated') {
        return 'Terminé';
    }
}
