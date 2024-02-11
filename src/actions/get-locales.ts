'use server';

import { cookies } from 'next/headers';
import { cache } from 'react';

export const getLocales = cache(async () => {
    const currentLocale = cookies().get('app-language')?.value || 'fr';
    const locales: Record<string, string> = {}; // TODO

    return {
        locales,
        currentLocale,
    };
});
