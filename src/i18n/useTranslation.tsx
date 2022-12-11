import React from 'react';

import type { tFunction } from './translateFunction';
import { getTranslateFunction } from './translateFunction';

const translationContext = React.createContext<{ t: tFunction; currentLocale: string }>({
    t: () => '',
    currentLocale: 'fr',
});

type TranslationContextProviderProps = {
    language: string;
    locales: { [key: string]: string };
};
export const TranslationContextProvider = ({ children, locales, language }: React.PropsWithChildren<TranslationContextProviderProps>) => {
    const translationFonction = React.useMemo(() => getTranslateFunction(language, locales), [language, locales]);
    const translationContextValue = React.useMemo(() => ({ t: translationFonction, currentLocale: language }), [translationFonction, language]);
    return <translationContext.Provider value={translationContextValue}>{children}</translationContext.Provider>;
};

export const useTranslation = () => {
    const { t, currentLocale } = React.useContext(translationContext);
    return { t, currentLocale };
};
