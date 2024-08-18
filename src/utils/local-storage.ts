'use client';

import type { Scenario } from 'src/database/schemas/scenarios';
import type { Theme } from 'src/database/schemas/themes';

export type LocalTheme = Omit<Theme, 'id'> & {
    id: string;
};
export const isLocalTheme = (theme: Theme | LocalTheme): theme is LocalTheme => typeof theme.id === 'string';

export type LocalScenario = Omit<Scenario, 'id' | 'themeId'> & {
    id: string;
    themeId: string | number;
};
export const isLocalScenario = (scenario: Scenario | LocalScenario): scenario is LocalScenario => typeof scenario.id === 'string';

export type LocalStorageKey = 'themes' | 'scenarios';
export type ObjectType<T extends LocalStorageKey> = T extends 'themes' ? LocalTheme[] : T extends 'scenarios' ? LocalScenario[] : never;

export function getFromLocalStorage<T extends LocalStorageKey>(key: T): ObjectType<T> | undefined {
    try {
        const localItem = localStorage.getItem(key);
        return localItem ? (JSON.parse(localItem) as ObjectType<T>) : undefined;
    } catch {
        return undefined;
    }
}

export function setToLocalStorage<T extends LocalStorageKey>(key: T, item: ObjectType<T>) {
    try {
        localStorage.setItem(key, JSON.stringify(item));
    } catch {
        // do nothing...
    }
}
