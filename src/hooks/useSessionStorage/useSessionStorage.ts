'use client';

import * as React from 'react';

import type { SessionStorageKey, ObjectType } from './session-storage';
import { getFromSessionStorage, setToSessionStorage, UPDATE_EVENT_NAME } from './session-storage';

export function useSessionStorage<T extends SessionStorageKey>(
    key: T,
    initialValue: ObjectType<T>,
): [ObjectType<T>, (newItem: ObjectType<T>) => void, boolean];
export function useSessionStorage<T extends SessionStorageKey>(
    key: T,
    initialValue?: ObjectType<T>,
): [ObjectType<T> | undefined, (newItem: ObjectType<T>) => void, boolean];
export function useSessionStorage<T extends SessionStorageKey>(
    key: T,
    initialValue?: ObjectType<T>,
): [ObjectType<T> | undefined, (newItem: ObjectType<T>) => void, boolean] {
    const isLoadingRef = React.useRef(true);
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
            isLoadingRef.current = false;
            return getFromSessionStorage(key) || initialValue;
        },
        () => initialValue,
    );

    const setItem = React.useCallback(
        (newItem: ObjectType<T>) => {
            setToSessionStorage(key, newItem);
        },
        [key],
    );

    return [item, setItem, isLoadingRef.current];
}
