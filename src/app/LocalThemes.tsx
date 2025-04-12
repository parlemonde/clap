'use client';

import * as React from 'react';

import { ThemeCard } from 'src/components/create/ThemeCard';
import { useLocalStorage } from 'src/hooks/useLocalStorage';

export const LocalThemes = () => {
    const [localThemes] = useLocalStorage('themes', []);

    return (
        <>
            {localThemes.map((theme, index) => (
                <ThemeCard key={theme.id} index={index + 1} name={theme.name} href={`/create/1-scenario?themeId=${theme.id}`} />
            ))}
        </>
    );
};
