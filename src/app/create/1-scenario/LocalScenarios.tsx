'use client';

import React from 'react';

import { ScenarioCard } from 'src/components/create/ScenarioCard';
import { useTranslation } from 'src/contexts/translationContext';
import { useLocalStorage } from 'src/hooks/useLocalStorage';
import { serializeToQueryUrl } from 'src/utils/serialize-to-query-url';

type LocalScenariosProps = {
    themeId: string | number;
};
export const LocalScenarios = ({ themeId }: LocalScenariosProps) => {
    const { currentLocale } = useTranslation();
    const scenarios = useLocalStorage('scenarios') || [];

    return (
        <>
            {scenarios
                .filter((s) => s.names[currentLocale] !== undefined || s.isDefault === false)
                .map((s) => (
                    <ScenarioCard
                        key={s.id}
                        name={s.names[currentLocale] || s.names[Object.keys(s.names)[0]] || ''}
                        description={s.descriptions[currentLocale] || s.descriptions[Object.keys(s.descriptions)[0]] || ''}
                        href={`/create/2-questions${serializeToQueryUrl({ themeId, scenarioId: s.id })}`}
                    />
                ))}
        </>
    );
};
