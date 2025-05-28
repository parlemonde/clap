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
function isLocalThemeShape(value: unknown): value is LocalTheme {
    return (
        typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        typeof value.id === 'string' &&
        'name' in value &&
        typeof value.name === 'string'
    );
}
function isLocalThemesShape(value: unknown): value is LocalTheme[] {
    return Array.isArray(value) && value.every(isLocalThemeShape);
}

export type LocalScenario = {
    id: string;
    name: string;
    description?: string;
    themeId: string | number;
};
export const isLocalScenario = (scenario: Scenario | LocalScenario): scenario is LocalScenario => typeof scenario.id === 'string';
function isLocalScenarioShape(value: unknown): value is LocalScenario {
    return (
        typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        typeof value.id === 'string' &&
        'name' in value &&
        typeof value.name === 'string' &&
        ('description' in value ? typeof value.description === 'string' : true) &&
        'themeId' in value &&
        (typeof value.themeId === 'string' || typeof value.themeId === 'number')
    );
}
function isLocalScenariosShape(value: unknown): value is LocalScenario[] {
    return Array.isArray(value) && value.every(isLocalScenarioShape);
}

function isProjectShape(value: unknown): value is ProjectData {
    return (
        typeof value === 'object' &&
        value !== null &&
        'themeId' in value &&
        (typeof value.themeId === 'string' || typeof value.themeId === 'number') &&
        'themeName' in value &&
        typeof value.themeName === 'string' &&
        'scenarioId' in value &&
        (typeof value.scenarioId === 'string' || typeof value.scenarioId === 'number') &&
        'scenarioName' in value &&
        typeof value.scenarioName === 'string' &&
        'questions' in value &&
        Array.isArray(value.questions) && // Ignore type guard for questions
        ('soundUrl' in value ? typeof value.soundUrl === 'string' : true) &&
        ('soundVolume' in value ? typeof value.soundVolume === 'number' : true) &&
        ('soundBeginTime' in value ? typeof value.soundBeginTime === 'number' : true)
    );
}

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

const typeGuards: Record<LocalStorageKey, (value: unknown) => boolean> = {
    themes: isLocalThemesShape,
    scenarios: isLocalScenariosShape,
    project: isProjectShape,
    projectId: (value) => typeof value === 'number',
    videoJobId: (value) => typeof value === 'string',
};

export function getFromLocalStorage<T extends LocalStorageKey>(key: T): ObjectType<T> | undefined {
    try {
        const localItemStr = localStorage.getItem(key);
        const localItem = localItemStr ? JSON.parse(localItemStr) : undefined;
        const isValidShape = typeGuards[key](localItem);
        if (isValidShape && isEqual(localStorageCache[key], localItem)) {
            return localStorageCache[key] as ObjectType<T>;
        }
        localStorageCache[key] = localItem;
        return isValidShape ? localItem : undefined;
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
