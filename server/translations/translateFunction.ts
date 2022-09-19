import { PluralResolver } from './getPlurals';

const optionsRegex = /{{(.+?)}}/gm;

interface translateOptions {
    count?: number;
    [key: string]: string | number | undefined;
}

export type tFunction = (key: string, options?: translateOptions) => string;

export class Translator {
    private pluralResolver = new PluralResolver();
    private language: string = '';
    private locales: { [key: string]: string } = {};
    private hasInit: boolean = false;

    public init = (language: string, locales: { [key: string]: string }): void => {
        if (this.hasInit) {
            return;
        }
        this.language = language;
        this.locales = locales;
        this.hasInit = true;
    };

    public translate = (key: string, options: translateOptions = {}): string => {
        if (!this.hasInit) {
            return key;
        }

        let pluralSuffix: string = '';
        if (options.count !== undefined) {
            pluralSuffix = this.pluralResolver.getPluralSuffix(this.language, options.count);
        }
        let translatedStr = this.locales[key + pluralSuffix] || this.locales[key] || key;
        translatedStr = translatedStr.replace(
            optionsRegex,
            (_match: string, group: string) => `${options[group] !== undefined ? options[group] : ''}`,
        );
        return translatedStr;
    };
}
