'use client';

import * as React from 'react';

import { ThemeCard } from '@frontend/components/create/ThemeCard';
import { useTranslation } from '@frontend/contexts/translationContext';
import { useLocalStorage } from '@frontend/hooks/useLocalStorage';
import type { Theme } from '@server/database/schemas/themes';

interface ThemesProps {
    themes: Theme[];
}

export const Themes = ({ themes }: ThemesProps) => {
    const { t, currentLocale } = useTranslation();
    const [localThemes] = useLocalStorage('themes', []);

    return (
        <div className="themes-grid">
            <ThemeCard href="/create/new-theme" name={t('new_theme_page.common.add_theme')} />
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
