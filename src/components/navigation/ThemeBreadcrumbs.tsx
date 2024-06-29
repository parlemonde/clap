'use server';

import React from 'react';

import { getTranslation } from 'src/actions/get-translation';
import { getTheme } from 'src/actions/themes/get-theme';
import { LocalThemeName } from 'src/components/create/LocalThemeName';
import { Breadcrumbs } from 'src/components/layout/Breadcrumbs';
import { Placeholder } from 'src/components/layout/Placeholder';

type ThemeBreadcrumbsProps = {
    themeId: string | number;
};
const ThemeBreadcrumbsWithTheme = async ({ themeId }: ThemeBreadcrumbsProps) => {
    const { t, currentLocale } = await getTranslation();
    const theme = typeof themeId === 'number' ? await getTheme(themeId) : null;

    return (
        <Breadcrumbs
            marginTop="sm"
            links={[{ href: '/', label: t('all_themes') }]}
            currentLabel={theme ? theme?.names[currentLocale] || theme?.names.fr || '' : <LocalThemeName themeId={`${themeId}`} />}
            className="for-tablet-up-only"
        />
    );
};

export const ThemeBreadcrumbs = async ({ themeId }: ThemeBreadcrumbsProps) => {
    const { t } = await getTranslation();

    return (
        <React.Suspense
            fallback={
                <Breadcrumbs
                    marginTop="sm"
                    links={[{ href: '/', label: t('all_themes') }]}
                    currentLabel={<Placeholder variant="text" width="100px" style={{ verticalAlign: 'bottom' }} />}
                    className="for-tablet-up-only"
                />
            }
        >
            <ThemeBreadcrumbsWithTheme themeId={themeId}></ThemeBreadcrumbsWithTheme>
        </React.Suspense>
    );
};
