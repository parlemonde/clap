'use client';

import isEqual from 'fast-deep-equal/es6';

export const UPDATE_EVENT_NAME = 'session-storage-update';

export type SessionStorageKey = 'collaborationCode';
export type ObjectType<T extends SessionStorageKey> = T extends 'collaborationCode' ? number : never;

const sessionStorageCache: Record<SessionStorageKey, unknown> = {
    collaborationCode: undefined,
};

export function getFromSessionStorage<T extends SessionStorageKey>(key: T): ObjectType<T> | undefined {
    try {
        const sessionItemStr = sessionStorage.getItem(key);
        const sessionItem = sessionItemStr ? (JSON.parse(sessionItemStr) as ObjectType<T>) : undefined;
        if (isEqual(sessionStorageCache[key], sessionItem)) {
            return sessionStorageCache[key] as ObjectType<T>;
        }
        sessionStorageCache[key] = sessionItem;
        return sessionItem;
    } catch {
        return undefined;
    }
}

export function setToSessionStorage<T extends SessionStorageKey>(key: T, item: ObjectType<T>) {
    try {
        sessionStorage.setItem(key, JSON.stringify(item));
        sessionStorageCache[key] = item;
        const event = new Event(UPDATE_EVENT_NAME);
        window.dispatchEvent(event);
    } catch {
        // do nothing...
    }
}

export function deleteFromSessionStorage(key: SessionStorageKey) {
    try {
        sessionStorage.removeItem(key);
        sessionStorageCache[key] = undefined;
        const event = new Event(UPDATE_EVENT_NAME);
        window.dispatchEvent(event);
    } catch {
        // do nothing...
    }
}
