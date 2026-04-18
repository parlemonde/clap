import { cookies } from 'next/headers';
import type { AbstractIntlMessages } from 'next-intl';
import { cache } from 'react';

import { getDynamoDBItem, setDynamoDBItem } from '@server/aws/dynamoDb';

import { APP_LANGUAGE_COOKIE_NAME, DEFAULT_LOCALE } from './constants';
import { defaultLocales } from './default-locales';

function mergeMessages(baseMessages: AbstractIntlMessages, overrideMessages: AbstractIntlMessages): AbstractIntlMessages {
    const mergedMessages: AbstractIntlMessages = { ...baseMessages };

    for (const [key, value] of Object.entries(overrideMessages)) {
        const currentValue = mergedMessages[key];
        if (
            value !== null &&
            typeof value === 'object' &&
            !Array.isArray(value) &&
            currentValue !== null &&
            typeof currentValue === 'object' &&
            !Array.isArray(currentValue)
        ) {
            mergedMessages[key] = mergeMessages(currentValue, value);
        } else {
            mergedMessages[key] = value;
        }
    }

    return mergedMessages;
}

export const getLocalesForLanguage = cache(async (languageCode: string) => {
    let locales: AbstractIntlMessages = defaultLocales;

    try {
        const dynamoDbLocales = await getDynamoDBItem<AbstractIntlMessages>(`locales:${languageCode}`);
        if (dynamoDbLocales) {
            locales = mergeMessages(locales, dynamoDbLocales);
        } else {
            await setDynamoDBItem(`locales:${languageCode}`, locales);
        }
    } catch (err) {
        console.error(err);
    }

    return locales;
});

export async function getRequestLocale(): Promise<string> {
    const cookieStore = await cookies();
    return cookieStore.get(APP_LANGUAGE_COOKIE_NAME)?.value || DEFAULT_LOCALE;
}

export async function getRequestLocales() {
    const currentLocale = await getRequestLocale();

    return {
        currentLocale,
        locales: await getLocalesForLanguage(currentLocale),
    };
}
