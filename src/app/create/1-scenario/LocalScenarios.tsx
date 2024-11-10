'use client';

import React from 'react';

import { Scenarios } from './Scenarios';
import { useTranslation } from 'src/contexts/translationContext';
import { useLocalStorage } from 'src/hooks/useLocalStorage';

type LocalScenariosProps = {
    themeId: string | number;
};
export const LocalScenarios = ({ themeId }: LocalScenariosProps) => {
    const { currentLocale } = useTranslation();
    const [scenarios] = useLocalStorage('scenarios', []);

    return <Scenarios scenarios={scenarios.filter((s) => s.names[currentLocale] !== undefined && s.themeId === themeId)} />;
};
