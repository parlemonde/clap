'use client';

import * as React from 'react';

import { useTranslation } from 'src/contexts/tanslationContext';
import { useLocalStorage } from 'src/hooks/useLocalStorage';

type LocalThemeNameProps = {
    themeId: string;
};

export const LocalThemeName = ({ themeId }: LocalThemeNameProps) => {
    const { currentLocale } = useTranslation();
    const localThemes = useLocalStorage('themes') || [];
    const theme = localThemes.find((theme) => theme.id === themeId);

    return <>{theme ? theme.names?.[currentLocale] || theme.names?.fr || '' : ''}</>;
};
