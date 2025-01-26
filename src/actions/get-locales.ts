'use server';

import { cookies } from 'next/headers';
import { cache } from 'react';

import DEFAULT_LOCALES from 'src/i18n/default-locales.json';
import { getRedisValue } from 'src/redis/get-value';
import { setRedisValue } from 'src/redis/set-value';

export const getLocalesForLanguage = cache(async (languageCode: string) => {
    let locales: Record<string, string> = DEFAULT_LOCALES;

    try {
        const redisLocales = await getRedisValue<Record<string, string>>(`locales:${languageCode}`);
        if (redisLocales) {
            locales = { ...locales, ...redisLocales };
        } else {
            await setRedisValue(`locales:${languageCode}`, locales);
        }
    } catch (err) {
        console.error(err);
    }

    return locales;
});

export async function getLocales() {
    const cookieStore = await cookies();
    const currentLocale = cookieStore.get('app-language')?.value || 'fr';
    return {
        locales: await getLocalesForLanguage(currentLocale),
        currentLocale,
    };
}
