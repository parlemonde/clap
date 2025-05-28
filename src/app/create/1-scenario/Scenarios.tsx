'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import useSWR from 'swr';

import { ScenarioCard } from 'src/components/create/ScenarioCard';
import { useTranslation } from 'src/contexts/translationContext';
import type { Question } from 'src/database/schemas/questions';
import type { Scenario } from 'src/database/schemas/scenarios';
import type { Theme } from 'src/database/schemas/themes';
import { useLocalStorage } from 'src/hooks/useLocalStorage';
import { deleteFromLocalStorage, isLocalScenario, isLocalTheme, setToLocalStorage } from 'src/hooks/useLocalStorage/local-storage';
import { jsonFetcher } from 'src/lib/json-fetcher';
import { serializeToQueryUrl } from 'src/lib/serialize-to-query-url';

interface ScenariosProps {
    scenarios: Scenario[];
    themeId: string | number;
}

export const Scenarios = ({ scenarios, themeId }: ScenariosProps) => {
    const router = useRouter();
    const { t, currentLocale } = useTranslation();

    const { data: themes } = useSWR<Theme[]>('/api/themes', jsonFetcher);
    const [localThemes] = useLocalStorage('themes', []);
    const [localScenarios] = useLocalStorage('scenarios', []);

    const allScenarios = [...scenarios, ...localScenarios.filter((s) => Boolean(s.name) && s.themeId === themeId)];

    return (
        <>
            {allScenarios.map((s) => {
                const name = isLocalScenario(s) ? s.name : s.names[currentLocale] || s.names[Object.keys(s.names)[0]] || '';
                const description = isLocalScenario(s)
                    ? s.description
                    : s.descriptions[currentLocale] || s.descriptions[Object.keys(s.descriptions)[0]] || '';
                return (
                    <ScenarioCard
                        key={s.id}
                        name={name}
                        description={description}
                        questionsCount={
                            isLocalScenario(s)
                                ? undefined
                                : s.questionsCount
                                  ? t('1_scenario_page.scenario_card.step_count', { count: s.questionsCount })
                                  : undefined
                        }
                        href="/create/2-questions"
                        onClick={async (event) => {
                            // Prevent navigation to the next page and create a new project
                            event.preventDefault();
                            const questions = await jsonFetcher<Question[]>(`/api/questions-templates${serializeToQueryUrl({ scenarioId: s.id })}`);
                            const theme =
                                typeof s.themeId === 'number'
                                    ? themes?.find((theme) => theme.id === s.themeId)
                                    : localThemes.find((theme) => theme.id === s.themeId);
                            const themeName =
                                theme && isLocalTheme(theme)
                                    ? theme.name
                                    : theme
                                      ? theme.names[currentLocale] || theme.names[Object.keys(theme.names)[0]] || ''
                                      : '';
                            // Create a new project with the selected scenario and selected theme
                            deleteFromLocalStorage('projectId');
                            setToLocalStorage('project', {
                                themeId: s.themeId,
                                themeName,
                                scenarioId: s.id,
                                scenarioName: name,
                                questions: questions.map((question, index) => ({
                                    id: index,
                                    question: question.question,
                                    plans: [
                                        {
                                            id: 0,
                                            description: '',
                                            imageUrl: '',
                                            duration: 3000,
                                        },
                                    ],
                                })),
                            });
                            router.push('/create/2-questions');
                        }}
                    />
                );
            })}
        </>
    );
};
