'use client';

import type { Theme } from 'src/database/schema/themes';

export type LocalTheme = Omit<Theme, 'id'> & {
    id: string;
};
export const isLocalTheme = (theme: Theme | LocalTheme): theme is LocalTheme => typeof theme.id === 'string';

export type LocalStorageKey = 'themes';
export type ObjectType<T extends LocalStorageKey> = T extends 'themes' ? LocalTheme[] : never;

export function getFromLocalStorage<T extends LocalStorageKey>(key: T): ObjectType<T> | undefined {
    try {
        const localItem = localStorage.getItem(key);
        return localItem ? JSON.parse(localItem) : undefined;
    } catch (e) {
        return undefined;
    }
}

export function setToLocalStorage<T extends LocalStorageKey>(key: T, item: ObjectType<T>) {
    try {
        localStorage.setItem(key, JSON.stringify(item));
    } catch (e) {
        // do nothing...
    }
}
