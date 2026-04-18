import type { TranslationValues } from 'next-intl';

export type TranslateOptions = TranslationValues & {
    count?: number;
};

export type tFunction = (key: string, options?: TranslateOptions) => string;
