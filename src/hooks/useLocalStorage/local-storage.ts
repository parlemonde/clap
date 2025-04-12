'use client';

import isEqual from 'fast-deep-equal/es6';

import type { ProjectData } from 'src/database/schemas/projects';
import type { Scenario } from 'src/database/schemas/scenarios';
import type { Theme } from 'src/database/schemas/themes';

export const UPDATE_EVENT_NAME = 'local-storage-update';

export type LocalTheme = {
    id: string;
    name: string;
};
export const isLocalTheme = (theme: Theme | LocalTheme): theme is LocalTheme => typeof theme.id === 'string';

export type LocalScenario = {
    id: string;
    name: string;
    description: string;
    themeId: string | number;
};
export const isLocalScenario = (scenario: Scenario | LocalScenario): scenario is LocalScenario => typeof scenario.id === 'string';

export type LocalStorageKey = 'themes' | 'scenarios' | 'project' | 'projectId' | 'videoJobId';
export type ObjectType<T extends LocalStorageKey> = T extends 'themes'
    ? LocalTheme[]
    : T extends 'scenarios'
      ? LocalScenario[]
      : T extends 'project'
        ? ProjectData
        : T extends 'projectId'
          ? number
          : T extends 'videoJobId'
            ? string
            : never;

const localStorageCache: Record<LocalStorageKey, unknown> = {
    themes: undefined,
    scenarios: undefined,
    project: undefined,
    projectId: undefined,
    videoJobId: undefined,
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
        const event = new Event(UPDATE_EVENT_NAME);
        window.dispatchEvent(event);
    } catch {
        // do nothing...
    }
}

export function deleteFromLocalStorage(key: LocalStorageKey) {
    try {
        localStorage.removeItem(key);
        localStorageCache[key] = undefined;
        const event = new Event(UPDATE_EVENT_NAME);
        window.dispatchEvent(event);
    } catch {
        // do nothing...
    }
}
