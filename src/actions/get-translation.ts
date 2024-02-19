'use server';

import { getLocales } from './get-locales';
import { translateFunction } from 'src/i18n/translateFunction';

export const getTranslation = async () => {
    const { currentLocale, locales } = await getLocales();
    const t = translateFunction(currentLocale, locales);

    return {
        t,
        currentLocale,
    };
};
