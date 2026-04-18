import { eq } from 'drizzle-orm';
import { unstable_cacheLife as cacheLife, revalidateTag, unstable_cacheTag as cacheTag } from 'next/cache';
import { cookies } from 'next/headers';
import type { AbstractIntlMessages } from 'next-intl';

import { db } from '@server/database';
import { languages } from '@server/database/schemas/languages';

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

export function getLocalesCacheTag(languageCode: string): string {
    return `locales:${languageCode}`;
}

export function revalidateLocalesCacheTag(languageCode: string): void {
    revalidateTag(getLocalesCacheTag(languageCode));
}

export async function getLocalesForLanguage(languageCode: string) {
    'use cache';

    cacheLife('hours');
    cacheTag(getLocalesCacheTag(languageCode));

    let locales: AbstractIntlMessages = defaultLocales;

    try {
        const language = await db.query.languages.findFirst({
            columns: {
                locales: true,
            },
            where: eq(languages.value, languageCode),
        });
        if (language?.locales) {
            locales = mergeMessages(locales, language.locales);
        }
    } catch (err) {
        console.error(err);
    }

    return locales;
}

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
