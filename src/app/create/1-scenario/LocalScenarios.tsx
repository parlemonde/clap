'use client';

import React from 'react';

import { Scenarios } from './Scenarios';
import { useLocalStorage } from 'src/hooks/useLocalStorage';

type LocalScenariosProps = {
    themeId: string | number;
};
export const LocalScenarios = ({ themeId }: LocalScenariosProps) => {
    const [scenarios] = useLocalStorage('scenarios', []);

    return <Scenarios scenarios={scenarios.filter((s) => Boolean(s.name) && s.themeId === themeId)} />;
};
