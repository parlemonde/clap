import * as React from 'react';

import { getCurrentUser } from 'src/actions/get-current-user';
import { getTranslation } from 'src/actions/get-translation';
import { listScenarios } from 'src/actions/scenarios/list-scenarios';
import { ScenarioCard } from 'src/components/create/ScenarioCard';
import { serializeToQueryUrl } from 'src/utils/serialize-to-query-url';

type ScenariosProps = {
    themeId: number;
};
export const Scenarios = async ({ themeId }: ScenariosProps) => {
    const { t, currentLocale } = await getTranslation();

    if (themeId === -1 || Number.isNaN(themeId) || !Number.isFinite(themeId)) {
        return null;
    }
    const user = await getCurrentUser();
    const scenarios = await listScenarios({ themeId: Number(themeId), userId: user?.id });

    const getQuestionCountString = (questionsCounts: Record<string, number> = {}) => {
        const count = questionsCounts[currentLocale] || questionsCounts.fr || 0;
        if (count) {
            return t('step', { count });
        }
        return undefined;
    };

    return (
        <>
            {scenarios
                .filter((s) => s.names[currentLocale] !== undefined || s.isDefault === false)
                .map((s) => (
                    <ScenarioCard
                        key={s.id}
                        name={s.names[currentLocale] || s.names[Object.keys(s.names)[0]] || ''}
                        description={s.descriptions[currentLocale] || s.descriptions[Object.keys(s.descriptions)[0]] || ''}
                        questionsCount={getQuestionCountString(s.questionsCount)}
                        href={`/create/2-questions${serializeToQueryUrl({ themeId, scenarioId: s.id })}`}
                    />
                ))}
        </>
    );
};
