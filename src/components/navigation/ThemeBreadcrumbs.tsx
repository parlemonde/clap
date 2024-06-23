'use server';

import React from 'react';

import { getTranslation } from 'src/actions/get-translation';
import { getTheme } from 'src/actions/themes/get-theme';
import { LocalThemeName } from 'src/components/create/LocalThemeName';
import { Breadcrumbs } from 'src/components/layout/Breadcrumbs';
import { Placeholder } from 'src/components/layout/Placeholder';

type ThemeBreadcrumbsProps = {
    themeId: string;
};
const ThemeBreadcrumbsWithTheme = async ({ themeId }: ThemeBreadcrumbsProps) => {
    const { t, currentLocale } = await getTranslation();

    const isLocalTheme = themeId.startsWith('local_');
    const theme = isLocalTheme ? undefined : await getTheme(Number(themeId) ?? -1);

    return (
        <Breadcrumbs
            marginTop="sm"
            links={[{ href: '/', label: t('all_themes') }]}
            currentLabel={isLocalTheme ? <LocalThemeName themeId={themeId} /> : theme?.names[currentLocale] || theme?.names.fr || ''}
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
