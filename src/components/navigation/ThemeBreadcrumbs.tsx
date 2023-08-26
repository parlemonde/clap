import React from 'react';

import { Breadcrumbs } from 'src/components/layout/Breadcrumbs';
import { Placeholder } from 'src/components/layout/Placeholder';
import { useTranslation } from 'src/i18n/useTranslation';
import type { Theme } from 'types/models/theme.type';

type ThemeBreadcrumbsProps = {
    theme?: Theme;
    isLoading?: boolean;
};
export const ThemeBreadcrumbs = ({ theme, isLoading }: ThemeBreadcrumbsProps) => {
    const { t, currentLocale } = useTranslation();

    return (
        <Breadcrumbs
            marginTop="sm"
            links={[{ href: '/create', label: t('all_themes') }]}
            currentLabel={
                isLoading ? (
                    <Placeholder variant="text" width="100px" style={{ verticalAlign: 'bottom' }} />
                ) : theme ? (
                    theme.names[currentLocale] || theme.names.fr || ''
                ) : (
                    ''
                )
            }
            className="for-tablet-up-only"
        />
    );
};
