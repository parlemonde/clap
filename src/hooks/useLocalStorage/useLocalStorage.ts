'use client';

import * as React from 'react';

import type { LocalStorageKey, ObjectType } from './local-storage';
import { getFromLocalStorage, setToLocalStorage, UPDATE_EVENT_NAME } from './local-storage';

export function useLocalStorage<T extends LocalStorageKey>(
    key: T,
    initialValue: ObjectType<T>,
): [ObjectType<T>, (newItem: ObjectType<T>) => void, boolean];
export function useLocalStorage<T extends LocalStorageKey>(
    key: T,
    initialValue?: ObjectType<T>,
): [ObjectType<T> | undefined, (newItem: ObjectType<T>) => void, boolean];
export function useLocalStorage<T extends LocalStorageKey>(
    key: T,
    initialValue?: ObjectType<T>,
): [ObjectType<T> | undefined, (newItem: ObjectType<T>) => void, boolean] {
    const [isLoading, setIsLoading] = React.useState(true);
    const item = React.useSyncExternalStore(
        (callback) => {
            window.addEventListener('storage', callback); // cross-tab events
            window.addEventListener(UPDATE_EVENT_NAME, callback); // same-page events
            return () => {
                window.removeEventListener('storage', callback);
                window.removeEventListener(UPDATE_EVENT_NAME, callback);
            };
        },
        () => {
            setIsLoading(false);
            return getFromLocalStorage(key) || initialValue;
        },
        () => initialValue,
    );

    const setItem = React.useCallback(
        (newItem: ObjectType<T>) => {
            setToLocalStorage(key, newItem);
        },
        [key],
    );

    return [item, setItem, isLoading];
}
