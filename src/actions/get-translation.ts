import { getLocales } from './get-locales';
import { translateFunction } from 'src/i18n/translateFunction';

export async function getTranslation() {
    const { currentLocale, locales } = await getLocales();
    const t = translateFunction(currentLocale, locales);

    return {
        t,
        currentLocale,
    };
}
