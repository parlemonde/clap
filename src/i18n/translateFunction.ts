import { getPluralSuffix } from './getPlurals';

const optionsRegex = /{{(.+?)}}/gm;

type translateOptions = {
    [key: string]: string | number;
} & {
    count?: number;
};
export type tFunction = (key: string, options?: translateOptions) => string;

export function translateFunction(language: string, locales: { [key: string]: string }): tFunction {
    return (key: string, options: translateOptions = {}) => {
        let pluralSuffix: string = '';
        if (options.count !== undefined) {
            pluralSuffix = getPluralSuffix(language, options.count);
        }
        let translatedStr = locales[key + pluralSuffix] || locales[key] || key;
        translatedStr = translatedStr.replace(
            optionsRegex,
            (_match: string, group: string) => `${options[group] !== undefined ? options[group] : ''}`,
        );
        return translatedStr;
    };
}
