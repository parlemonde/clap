'use client';

import * as React from 'react';

import type { LocalStorageKey, ObjectType } from './local-storage';
import { getFromLocalStorage, setToLocalStorage } from './local-storage';

export function useLocalStorage<T extends LocalStorageKey>(key: T, initialValue: ObjectType<T>): [ObjectType<T>, (newItem: ObjectType<T>) => void];
export function useLocalStorage<T extends LocalStorageKey>(
    key: T,
    initialValue?: ObjectType<T>,
): [ObjectType<T> | undefined, (newItem: ObjectType<T>) => void];
export function useLocalStorage<T extends LocalStorageKey>(
    key: T,
    initialValue?: ObjectType<T>,
): [ObjectType<T> | undefined, (newItem: ObjectType<T>) => void] {
    const item = React.useSyncExternalStore(
        (callback) => {
            window.addEventListener('storage', callback);
            return () => {
                window.removeEventListener('storage', callback);
            };
        },
        () => getFromLocalStorage(key) || initialValue,
        () => initialValue,
    );

    const setItem = React.useCallback(
        (newItem: ObjectType<T>) => {
            setToLocalStorage(key, newItem);
        },
        [key],
    );

    return [item, setItem];
}
