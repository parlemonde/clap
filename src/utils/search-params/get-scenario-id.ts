import type { SearchParams } from './search-params.types';

export function getScenarioId(searchParams: SearchParams) {
    return typeof searchParams.scenarioId === 'string'
        ? searchParams.scenarioId.startsWith('local_')
            ? searchParams.scenarioId
            : Number(searchParams.scenarioId) ?? 0
        : 0;
}
