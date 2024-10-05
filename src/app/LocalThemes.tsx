'use client';

import * as React from 'react';

import { ThemeCard } from 'src/components/create/ThemeCard';
import { useTranslation } from 'src/contexts/translationContext';
import { useLocalStorage } from 'src/hooks/useLocalStorage';

export const LocalThemes = () => {
    const { currentLocale } = useTranslation();
    const [localThemes] = useLocalStorage('themes', []);

    return (
        <>
            {localThemes.map((theme, index) => (
                <ThemeCard
                    key={theme.id}
                    index={index + 1}
                    imageUrl={theme.imageUrl}
                    name={theme.names?.[currentLocale] || theme.names?.fr || ''}
                    href={`/create/1-scenario?themeId=${theme.id}`}
                />
            ))}
        </>
    );
};
