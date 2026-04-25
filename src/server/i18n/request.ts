import { getRequestConfig } from 'next-intl/server';
import type { GetRequestConfigParams } from 'next-intl/server';

import { getLocalesForLanguage, getRequestLocale } from './server';

export default getRequestConfig(async ({ locale }: GetRequestConfigParams) => {
    const currentLocale = locale ?? (await getRequestLocale());

    return {
        locale: currentLocale,
        messages: await getLocalesForLanguage(currentLocale),
    };
});
