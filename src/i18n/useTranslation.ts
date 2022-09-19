import React, { useContext } from 'react';

import type { tFunction } from './translateFunction';
import { translator } from './translateFunction';

type useTranslationContextReturn = {
    t: tFunction;
    translationContext: React.Context<{ t: tFunction; currentLocale: string }>;
};

const translationContext = React.createContext<{ t: tFunction; currentLocale: string }>({
    t: () => '',
    currentLocale: '',
});

export const useTranslationContext = (language: string, locales: { [key: string]: string }): useTranslationContextReturn => {
    translator.init(language, locales);
    return { t: translator.translate, translationContext };
};

export const useTranslation = (): { t: tFunction; currentLocale: string } => {
    const { t, currentLocale } = useContext(translationContext);
    return { t, currentLocale };
};
