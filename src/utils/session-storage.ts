type SessionStorageKey = 'isCollaborationActive';
type ObjectType<T> = T extends 'isCollaborationActive' ? boolean : never;

const typeGuards: { [key in SessionStorageKey]: (value: unknown) => ObjectType<key> } = {
    isCollaborationActive: (value: unknown) => {
        if (typeof value === 'boolean') return value;
        return false;
    },
};
const getTypeGuard = <T extends SessionStorageKey>(storageKey: T): ((value: unknown) => ObjectType<T>) => {
    return typeGuards[storageKey] as (value: unknown) => ObjectType<T>;
};

export const getFromSessionStorage = <T extends SessionStorageKey>(
    storageKey: T,
    defaultValue: ObjectType<T>,
    isEnabled: boolean = true,
): ObjectType<T> => {
    if (!isEnabled) {
        return defaultValue;
    }
    try {
        const strData = sessionStorage.getItem(storageKey);
        if (strData) {
            return getTypeGuard(storageKey)(JSON.parse(strData));
        } else {
            return defaultValue;
        }
    } catch (e) {
        return defaultValue;
    }
};

export const setToSessionStorage = <T extends SessionStorageKey>(storageKey: T, data: ObjectType<T>) => {
    try {
        if (data === undefined) {
            sessionStorage.removeItem(storageKey);
        } else {
            sessionStorage.setItem(storageKey, JSON.stringify(data));
        }
    } catch (e) {
        return;
    }
};
