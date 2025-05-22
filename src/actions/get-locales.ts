'use server';

import { cookies } from 'next/headers';
import { cache } from 'react';

import { getDynamoDBItem, setDynamoDBItem } from 'src/aws/dynamoDb';
import { locales as defaultLocales } from 'src/i18n/locales';

export const getLocalesForLanguage = cache(async (languageCode: string) => {
    let locales: Record<string, string> = defaultLocales;

    try {
        const dynamoDbLocales = await getDynamoDBItem<Record<string, string>>(`locales:${languageCode}`);
        if (dynamoDbLocales) {
            locales = { ...locales, ...dynamoDbLocales };
        } else {
            await setDynamoDBItem(`locales:${languageCode}`, locales);
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
