'use client';

import React from 'react';

import { Breadcrumbs } from 'src/components/layout/Breadcrumbs';
import { Placeholder } from 'src/components/layout/Placeholder';
import { useTranslation } from 'src/contexts/translationContext';
import type { Theme } from 'src/database/schemas/themes';
import { useLocalStorage } from 'src/hooks/useLocalStorage';

type ThemeBreadcrumbsProps = {
    theme?: Theme;
    themeId?: string;
};
export const ThemeBreadcrumbs = ({ theme, themeId }: ThemeBreadcrumbsProps) => {
    const { t, currentLocale } = useTranslation();
    const localThemes = useLocalStorage('themes');
    const currentTheme = theme || (localThemes || []).find((t) => t.id === themeId);

    return (
        <Breadcrumbs
            marginTop="sm"
            links={[{ href: '/', label: t('all_themes') }]}
            currentLabel={currentTheme?.names[currentLocale] || currentTheme?.names.fr || ''}
            className="for-tablet-up-only"
        />
    );
};

export const ThemeBreadcrumbsPlaceholder = () => {
    const { t } = useTranslation();

    return (
        <Breadcrumbs
            marginTop="sm"
            links={[{ href: '/', label: t('all_themes') }]}
            currentLabel={<Placeholder variant="text" width="100px" style={{ verticalAlign: 'bottom' }} />}
            className="for-tablet-up-only"
        />
    );
};
