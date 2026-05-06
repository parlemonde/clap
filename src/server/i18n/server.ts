import { eq } from 'drizzle-orm';
import { cacheLife, revalidateTag, cacheTag } from 'next/cache';
import { cookies } from 'next/headers';
import type { AbstractIntlMessages } from 'next-intl';

import { db } from '@server/database';
import { languages } from '@server/database/schemas/languages';
import { logger } from '@server/logger';

import { APP_LANGUAGE_COOKIE_NAME, DEFAULT_LOCALE } from './constants';

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
    revalidateTag(getLocalesCacheTag(languageCode), 'max');
}

async function getExtractedMessages(): Promise<AbstractIntlMessages> {
    return (await import(`./messages/fr.json`)).default as AbstractIntlMessages;
}

export async function getLocalesForLanguage(languageCode: string) {
    'use cache';

    cacheLife('hours');
    cacheTag(getLocalesCacheTag(languageCode));

    let locales = await getExtractedMessages();

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
        logger.error(err);
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
