'use client';

import isEqual from 'fast-deep-equal/es6';

import type { Scenario } from 'src/database/schemas/scenarios';
import type { Theme } from 'src/database/schemas/themes';

export interface Title {
    text: string;
    duration: number;
    x: number;
    y: number;
    width: number;
    fontSize: number;
    fontFamily: string;
    color: string;
    backgroundColor: string;
    textAlign: 'left' | 'center' | 'right' | 'justify';
}
export interface Plan {
    id: number;
    description: string;
    imageUrl: string;
    duration: number;
}

export interface Sequence {
    id: number;
    question: string;
    plans: Plan[];
    title?: Title;
    voiceText?: string;
    soundUrl?: string;
    soundVolume?: number;
    voiceOffBeginTime?: number;
}
export interface Project {
    id: 'local' | number;
    locale: string;
    name: string;
    themeId: string | number;
    themeName: string;
    scenarioId: string | number;
    scenarioName: string;
    questions: Sequence[];
    soundUrl?: string;
    soundVolume?: number;
    soundBeginTime?: number;
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
