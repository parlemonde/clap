import { isBoolean } from './is-boolean';
import { isNumber } from './is-number';
import { isObjectLiteral } from './is-object-literal';
import { isString } from './is-string';
import type { Scenario } from 'types/models/scenario.type';

export function isScenario(value: unknown): value is Scenario {
    return (
        isObjectLiteral(value) &&
        // id: string
        isString(value.id) &&
        // isDefault: boolean
        (value.isDefault === undefined || isBoolean(value.isDefault)) &&
        // names: Record<string, string>;
        isObjectLiteral(value.names) &&
        Object.values(value.names).every(isString) &&
        // descriptions: Record<string, string>;
        isObjectLiteral(value.descriptions) &&
        Object.values(value.descriptions).every(isString) &&
        // themeId: string | number;
        (isString(value.themeId) || isNumber(value.themeId)) &&
        // userId: number | null
        (isNumber(value.userId) || value.userId === null) &&
        // questionsCount: Record<string, number>;
        (value.questionsCount === undefined || (isObjectLiteral(value.questionsCount) && Object.values(value.questionsCount).every(isNumber)))
    );
}
