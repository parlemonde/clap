import { cookies } from 'next/headers';
import { cache } from 'react';

import DEFAULT_LOCALES from 'src/i18n/default-locales.json';
import { getRedisValue } from 'src/redis/get-value';
import { setRedisValue } from 'src/redis/set-value';

export const getLocales = cache(async () => {
    const currentLocale = cookies().get('app-language')?.value || 'fr';
    let locales: Record<string, string> = DEFAULT_LOCALES;

    try {
        const redisLocales = await getRedisValue<Record<string, string>>(`locales:${currentLocale}`);
        if (redisLocales) {
            locales = { ...locales, ...redisLocales };
        } else {
            await setRedisValue(`locales:${currentLocale}`, locales);
        }
    } catch (err) {
        console.error(err);
    }

    return {
        locales,
        currentLocale,
    };
});
