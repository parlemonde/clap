'use client';

import * as React from 'react';

import type { LocalStorageKey, ObjectType } from 'src/utils/local-storage';
import { getFromLocalStorage } from 'src/utils/local-storage';

export function useLocalStorage<T extends LocalStorageKey>(key: T): ObjectType<T> | undefined {
    const [item, setItem] = React.useState<ObjectType<T> | undefined>();

    React.useEffect(() => {
        // Set initial value from local storage in an effect to avoid hydration mismatch
        setItem(getFromLocalStorage(key));

        // Update local storage value when item changes in another tab
        const updateState = () => {
            setItem(getFromLocalStorage(key));
        };
        window.addEventListener('storage', updateState);
        return () => {
            window.removeEventListener('storage', updateState);
        };
    }, [key]);

    return item;
}
