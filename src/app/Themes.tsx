'use client';

import { useExtracted, useLocale } from 'next-intl';
import * as React from 'react';

import { ThemeCard } from '@frontend/components/create/ThemeCard';
import { useLocalStorage } from '@frontend/hooks/useLocalStorage';
import type { Theme } from '@server/database/schemas/themes';

interface ThemesProps {
    themes: Theme[];
}

export const Themes = ({ themes }: ThemesProps) => {
    const t = useExtracted('Themes');
    const currentLocale = useLocale();
    const [localThemes] = useLocalStorage('themes', []);

    return (
        <div className="themes-grid">
            <ThemeCard href="/create/new-theme" name={t('Ajouter votre thème')} />
            {themes?.map((theme, index) => (
                <ThemeCard
                    key={theme.id}
                    index={index + 1}
                    imageUrl={theme.imageUrl}
                    name={theme.names?.[currentLocale] || theme.names?.fr || ''}
                    href={`/create/1-scenario?themeId=${theme.id}`}
                />
            ))}
            {localThemes.map((theme, index) => (
                <ThemeCard key={theme.id} index={index + 1} name={theme.name} href={`/create/1-scenario?themeId=${theme.id}`} />
            ))}
        </div>
    );
};
