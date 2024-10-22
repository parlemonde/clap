'use client';

import React from 'react';
import useSWR from 'swr';

import { LocalThemeName } from 'src/components/create/LocalThemeName';
import { Breadcrumbs } from 'src/components/layout/Breadcrumbs';
import { Placeholder } from 'src/components/layout/Placeholder';
import { useTranslation } from 'src/contexts/translationContext';
import type { Theme } from 'src/database/schemas/themes';
import { useLocalStorage } from 'src/hooks/useLocalStorage';
import { jsonFetcher } from 'src/utils/json-fetcher';

type ThemeBreadcrumbsProps = {
    themeId: string | number;
};

export const ThemeBreadcrumbs = ({ themeId }: ThemeBreadcrumbsProps) => {
    const { t, currentLocale } = useTranslation();
    const { data: themes, isLoading } = useSWR<Theme[]>('/api/themes', jsonFetcher);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [localThemes, _setLocalThemes, isLoadingLocalThemes] = useLocalStorage('themes', []);

    if ((typeof themeId === 'number' && isLoading) || (typeof themeId === 'string' && isLoadingLocalThemes)) {
        return (
            <Breadcrumbs
                marginTop="sm"
                links={[{ href: '/', label: t('all_themes') }]}
                currentLabel={<Placeholder variant="text" width="100px" style={{ verticalAlign: 'bottom' }} />}
                className="for-tablet-up-only"
            />
        );
    }

    const theme = typeof themeId === 'number' ? themes?.find((theme) => theme.id === themeId) : localThemes.find((theme) => theme.id === themeId);

    return (
        <Breadcrumbs
            marginTop="sm"
            links={[{ href: '/', label: t('all_themes') }]}
            currentLabel={theme ? theme?.names[currentLocale] || theme?.names.fr || '' : <LocalThemeName themeId={`${themeId}`} />}
            className="for-tablet-up-only"
        />
    );
};
