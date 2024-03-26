import { isProject } from './type-guards/is-project';
import { isScenario } from './type-guards/is-scenario';
import { isStudent } from './type-guards/is-student-data';
import { isTheme } from './type-guards/is-theme';
import type { Project } from 'types/models/project.type';
import type { Scenario } from 'types/models/scenario.type';
import type { Student } from 'types/models/student.type';
import type { Theme } from 'types/models/theme.type';

type LocalStorageKey = 'themes' | 'scenarios' | 'project' | 'student';
type ObjectType<T> = T extends 'themes'
    ? Theme[]
    : T extends 'scenarios'
    ? Scenario[]
    : T extends 'project'
    ? Project | undefined
    : T extends 'student'
    ? Student | undefined
    : never;

const typeGuards: { [key in LocalStorageKey]: (value: unknown) => ObjectType<key> } = {
    themes: (value: unknown) => {
        if (!Array.isArray(value)) {
            return [];
        }
        return value.filter((obj) => isTheme(obj));
    },
    scenarios: (value: unknown) => {
        if (!Array.isArray(value)) {
            return [];
        }
        return value.filter((obj) => isScenario(obj));
    },
    project: (value: unknown) => (isProject(value) ? value : undefined),
    student: (value: unknown) => (isStudent(value) ? value : undefined),
};
const getTypeGuard = <T extends LocalStorageKey>(storageKey: T): ((value: unknown) => ObjectType<T>) => {
    return typeGuards[storageKey] as (value: unknown) => ObjectType<T>;
};

export const getFromLocalStorage = <T extends LocalStorageKey>(
    storageKey: T,
    defaultValue: ObjectType<T>,
    isEnabled: boolean = true,
): ObjectType<T> => {
    if (!isEnabled) {
        return defaultValue;
    }
    try {
        const strData = localStorage.getItem(storageKey);
        if (strData) {
            return getTypeGuard(storageKey)(JSON.parse(strData));
        } else {
            return defaultValue;
        }
    } catch (e) {
        return defaultValue;
    }
};

export const setToLocalStorage = <T extends LocalStorageKey>(storageKey: T, data: ObjectType<T>) => {
    try {
        if (data === undefined) {
            localStorage.removeItem(storageKey);
        } else {
            localStorage.setItem(storageKey, JSON.stringify(data));
        }
    } catch (e) {
        return;
    }
};
