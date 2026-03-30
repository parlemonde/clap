'use server';

import { translateFunction } from 'src/i18n/translateFunction';

import { getLocales } from './get-locales';

export async function getTranslation() {
    const { currentLocale, locales } = await getLocales();
    const t = translateFunction(currentLocale, locales);

    return {
        t,
        currentLocale,
    };
}
