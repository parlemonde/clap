'use client';
import { useRouter } from 'next/navigation';
import React from 'react';

import { Select } from 'src/components/layout/Form/Select';

interface ScenarioSelect {
    selectedScenarioId: number | undefined;
    scenarios: { id: number; names: { [key: string]: string } }[];
}
export const ScenarioSelect = ({ selectedScenarioId, scenarios }: ScenarioSelect) => {
    const router = useRouter();

    return (
        <Select
            value={selectedScenarioId ?? ''}
            onChange={(event) => {
                const url = new URL(window.location.href);
                url.searchParams.set('scenarioId', event.target.value);
                router.replace(url.toString());
            }}
            style={{ color: selectedScenarioId === undefined ? 'grey' : undefined }}
            isFullWidth
        >
            <option value={''} hidden>
                Choisissez un scénario
            </option>
            {scenarios.map((s) => (
                <option value={s.id} key={s.id}>
                    {s.names.fr || s.names[Object.keys(s.names)[0]]}
                </option>
            ))}
        </Select>
    );
};
