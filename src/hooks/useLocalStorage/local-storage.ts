'use client';

import isEqual from 'fast-deep-equal/es6';

import type { Scenario } from 'src/database/schemas/scenarios';
import type { Theme } from 'src/database/schemas/themes';

export interface Project {
    id: string | number;
    name: string;
    themeId: string | number;
    scenarioId: string | number;
    questions: { id: string | number; question: string }[];
}

export type LocalTheme = Omit<Theme, 'id'> & {
    id: string;
};
export const isLocalTheme = (theme: Theme | LocalTheme): theme is LocalTheme => typeof theme.id === 'string';

export type LocalScenario = Omit<Scenario, 'id' | 'themeId'> & {
    id: string;
    themeId: string | number;
};
export const isLocalScenario = (scenario: Scenario | LocalScenario): scenario is LocalScenario => typeof scenario.id === 'string';

export type LocalStorageKey = 'themes' | 'scenarios' | 'project';
export type ObjectType<T extends LocalStorageKey> = T extends 'themes'
    ? LocalTheme[]
    : T extends 'scenarios'
      ? LocalScenario[]
      : T extends 'project'
        ? Project
        : never;

const localStorageCache: Record<LocalStorageKey, unknown> = {
    themes: undefined,
    scenarios: undefined,
    project: undefined,
};

export function getFromLocalStorage<T extends LocalStorageKey>(key: T): ObjectType<T> | undefined {
    try {
        const localItemStr = localStorage.getItem(key);
        const localItem = localItemStr ? (JSON.parse(localItemStr) as ObjectType<T>) : undefined;
        if (isEqual(localStorageCache[key], localItem)) {
            return localStorageCache[key] as ObjectType<T>;
        }
        localStorageCache[key] = localItem;
        return localItem;
    } catch {
        return undefined;
    }
}

export function setToLocalStorage<T extends LocalStorageKey>(key: T, item: ObjectType<T>) {
    try {
        localStorage.setItem(key, JSON.stringify(item));
        localStorageCache[key] = item;
    } catch {
        // do nothing...
    }
}
