import type { SearchParams } from './search-params.types';

export function getThemeId(searchParams: SearchParams) {
    return typeof searchParams.themeId === 'string'
        ? searchParams.themeId.startsWith('local_')
            ? searchParams.themeId
            : (Number(searchParams.themeId) ?? 0)
        : 0;
}
