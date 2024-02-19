'use server';

import { cookies } from 'next/headers';
import { cache } from 'react';

import { getFile } from 'src/fileUpload';
import DEFAULT_LOCALES from 'src/i18n/default-locales.json';
import { getBufferFromStream } from 'src/utils/get-buffer-from-stream';

export const getLocales = cache(async () => {
    const currentLocale = cookies().get('app-language')?.value || 'fr';
    let locales: Record<string, string> = DEFAULT_LOCALES;

    try {
        const JSONlanguageBuffer = await getFile('locales', `${currentLocale}.json`).then(getBufferFromStream);
        if (JSONlanguageBuffer !== null) {
            locales = JSON.parse(JSONlanguageBuffer.toString());
        }
    } catch (err) {
        console.error(err);
    }

    return {
        locales,
        currentLocale,
    };
});
