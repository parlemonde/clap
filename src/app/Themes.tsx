'use server';

import * as React from 'react';

import { getCurrentUser } from 'src/actions/get-current-user';
import { getLocales } from 'src/actions/get-locales';
import { listThemes } from 'src/actions/themes/list-themes';
import { ThemeCard } from 'src/components/create/ThemeCard';

export default async function Themes() {
    const { currentLocale } = await getLocales();
    const user = await getCurrentUser();
    const themes = await listThemes({ userId: user?.id });

    return (
        <>
            {themes.map((theme, index) => (
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
}
