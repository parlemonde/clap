import { isBoolean } from './is-boolean';
import { isNumber } from './is-number';
import { isObjectLiteral } from './is-object-literal';
import { isScenario } from './is-scenario';
import { isString } from './is-string';
import type { Theme } from 'types/models/theme.type';

export function isTheme(value: unknown): value is Theme {
    return (
        isObjectLiteral(value) &&
        // id: string
        isString(value.id) &&
        // order: number
        isNumber(value.order) &&
        // isDefault: boolean
        (value.isDefault === undefined || isBoolean(value.isDefault)) &&
        // names: Record<string, string>
        isObjectLiteral(value.names) &&
        Object.values(value.names).every(isString) &&
        // imageUrl: string | null
        (isString(value.imageUrl) || value.imageUrl === null) &&
        // userId: number | null
        (isNumber(value.userId) || value.userId === null) &&
        // scenarios?: Scenario[];
        (value.scenarios === undefined || (Array.isArray(value.scenarios) && value.scenarios.every(isScenario)))
    );
}
