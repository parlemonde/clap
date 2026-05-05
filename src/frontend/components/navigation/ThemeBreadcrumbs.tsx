'use client';

import { useLocale, useTranslations } from 'next-intl';
import React from 'react';
import useSWR from 'swr';

import { Breadcrumbs } from '@frontend/components/layout/Breadcrumbs';
import { Placeholder } from '@frontend/components/layout/Placeholder';
import { userContext } from '@frontend/contexts/userContext';
import { useLocalStorage } from '@frontend/hooks/useLocalStorage';
import { isLocalTheme } from '@frontend/hooks/useLocalStorage/local-storage';
import { jsonFetcher } from '@lib/json-fetcher';
import type { Theme } from '@server/database/schemas/themes';

type ThemeBreadcrumbsProps = {
    themeId?: string | number | null;
};

export const ThemeBreadcrumbs = ({ themeId }: ThemeBreadcrumbsProps) => {
    const t = useTranslations();
    const currentLocale = useLocale();
    const user = React.useContext(userContext);
    const { data: themes, isLoading } = useSWR<Theme[]>('/api/themes', jsonFetcher);
    const [localThemes, _setLocalThemes, isLoadingLocalThemes] = useLocalStorage('themes', []);

    if (user?.role === 'student') {
        return null;
    }

    if ((typeof themeId === 'number' && isLoading) || (typeof themeId === 'string' && isLoadingLocalThemes)) {
        return (
            <Breadcrumbs
                marginTop="sm"
                links={[{ href: '/', label: t('common.filters.all_themes') }]}
                currentLabel={<Placeholder variant="text" width="100px" style={{ verticalAlign: 'bottom' }} />}
                className="for-tablet-up-only"
            />
        );
    }

    const theme = typeof themeId === 'number' ? themes?.find((theme) => theme.id === themeId) : localThemes.find((theme) => theme.id === themeId);
    const themeName = theme && isLocalTheme(theme) ? theme.name : theme ? theme.names[currentLocale] || theme.names.fr || '' : '';

    return (
        <Breadcrumbs
            marginTop="sm"
            links={[{ href: '/', label: t('common.filters.all_themes') }]}
            currentLabel={themeName}
            className="for-tablet-up-only"
        />
    );
};
