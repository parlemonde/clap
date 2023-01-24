import { isNumber } from './is-number';
import { isObjectLiteral } from './is-object-literal';
import { isString } from './is-string';
import type { Project } from 'types/models/project.type';

export function isProject(value: unknown): value is Project {
    return (
        isObjectLiteral(value) &&
        // id: string
        isNumber(value.id) &&
        // title: string
        isString(value.title) &&
        // createDate: string
        isString(value.createDate) &&
        // updateDate: string
        isString(value.updateDate) &&
        // languageCode: string
        isString(value.languageCode) &&
        // userId: number | null
        (isNumber(value.userId) || value.userId === null) &&
        // themeId: number | string
        (isString(value.themeId) || isNumber(value.themeId)) &&
        // scenarioId: number | string
        (isString(value.scenarioId) || isNumber(value.scenarioId)) &&
        // questions: Question[]
        (Array.isArray(value.questions) || value.questions === undefined) && // TODO More checks
        // musicBeginTime: number
        isNumber(value.musicBeginTime) &&
        // soundUrl: string | null
        (isString(value.soundUrl) || value.soundUrl === null) &&
        // soundVolume: number | null
        (isNumber(value.soundVolume) || value.soundVolume === null)
    );
}
