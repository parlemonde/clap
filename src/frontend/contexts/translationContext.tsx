'use client';

import { useLocale, useTranslations } from 'next-intl';
import * as React from 'react';

import type { tFunction } from '@server/i18n/types';

export const useTranslation = () => {
    const currentLocale = useLocale();
    const translator = useTranslations();
    const t = React.useMemo<tFunction>(() => {
        const translate = translator as (key: string, options?: Parameters<tFunction>[1]) => string;
        return (key, options = {}) => translate(key, options);
    }, [translator]);

    return { t, currentLocale };
};
