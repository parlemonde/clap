'use client';

import * as React from 'react';

import { ThemeCard } from 'src/components/create/ThemeCard';
import { useTranslation } from 'src/contexts/translationContext';
import type { Theme } from 'src/database/schemas/themes';
import { useLocalStorage } from 'src/hooks/useLocalStorage';

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
