'use server';

import { cookies } from 'next/headers';
import { cache } from 'react';

import { getDynamoDbValue, setDynamoDbValue } from 'src/dynamodb';
import DEFAULT_LOCALES from 'src/i18n/default-locales.json';

export const getLocalesForLanguage = cache(async (languageCode: string) => {
    let locales: Record<string, string> = DEFAULT_LOCALES;

    try {
        const dynamoDbLocales = await getDynamoDbValue<Record<string, string>>(`locales:${languageCode}`);
        if (dynamoDbLocales) {
            locales = { ...locales, ...dynamoDbLocales };
        } else {
            await setDynamoDbValue(`locales:${languageCode}`, locales);
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
