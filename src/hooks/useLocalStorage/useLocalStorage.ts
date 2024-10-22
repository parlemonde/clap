'use client';

import * as React from 'react';

import type { LocalStorageKey, ObjectType } from './local-storage';
import { getFromLocalStorage, setToLocalStorage } from './local-storage';

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
    const isLoadingRef = React.useRef(true);
    const item = React.useSyncExternalStore(
        (callback) => {
            window.addEventListener('storage', callback);
            window.addEventListener('storage-update', callback);
            return () => {
                window.removeEventListener('storage', callback);
                window.removeEventListener('storage-update', callback);
            };
        },
        () => {
            isLoadingRef.current = false;
            return getFromLocalStorage(key) || initialValue;
        },
        () => initialValue,
    );

    const setItem = React.useCallback(
        (newItem: ObjectType<T>) => {
            setToLocalStorage(key, newItem);
            const event = new Event('storage-update');
            window.dispatchEvent(event);
        },
        [key],
    );

    return [item, setItem, isLoadingRef.current];
}
