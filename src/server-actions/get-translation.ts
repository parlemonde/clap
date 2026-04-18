'use server';

import { getLocale, getTranslations } from 'next-intl/server';
import type { tFunction } from 'src/server/i18n/types';

export async function getTranslation() {
    const [translator, currentLocale] = await Promise.all([getTranslations(), getLocale()]);
    const translate = translator as (key: string, options?: Parameters<tFunction>[1]) => string;
    const t: tFunction = (key, options = {}) => translate(key, options);

    return {
        t,
        currentLocale,
    };
}
