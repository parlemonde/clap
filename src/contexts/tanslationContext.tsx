'use client';

import React from 'react';

import type { tFunction } from 'src/i18n/translateFunction';
import { translateFunction } from 'src/i18n/translateFunction';

const translationContext = React.createContext<{ t: tFunction; currentLocale: string }>({
    t: () => '',
    currentLocale: 'fr',
});

type TranslationContextProviderProps = {
    language: string;
    locales: { [key: string]: string };
};
export const TranslationContextProvider = ({ children, locales, language }: React.PropsWithChildren<TranslationContextProviderProps>) => {
    const t = React.useMemo(() => translateFunction(language, locales), [language, locales]);
    const translationContextValue = React.useMemo(() => ({ t, currentLocale: language }), [t, language]);
    return <translationContext.Provider value={translationContextValue}>{children}</translationContext.Provider>;
};

export const useTranslation = () => {
    const { t, currentLocale } = React.useContext(translationContext);
    return { t, currentLocale };
};
