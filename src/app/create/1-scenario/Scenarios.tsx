'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import useSWR from 'swr';

import { ScenarioCard } from 'src/components/create/ScenarioCard';
import { useTranslation } from 'src/contexts/translationContext';
import type { QuestionTemplate } from 'src/database/schemas/question-template';
import type { Scenario } from 'src/database/schemas/scenarios';
import type { Theme } from 'src/database/schemas/themes';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { useLocalStorage } from 'src/hooks/useLocalStorage';
import { deleteFromLocalStorage, setToLocalStorage, type LocalScenario } from 'src/hooks/useLocalStorage/local-storage';
import { jsonFetcher } from 'src/lib/json-fetcher';
import { serializeToQueryUrl } from 'src/lib/serialize-to-query-url';

interface ScenariosProps {
    scenarios: Array<Scenario | LocalScenario>;
}

export const Scenarios = ({ scenarios }: ScenariosProps) => {
    const router = useRouter();
    const { t, currentLocale } = useTranslation();
    const [projectId] = useLocalStorage('projectId');
    const { project } = useCurrentProject();

    const { data: themes } = useSWR<Theme[]>('/api/themes', jsonFetcher);
    const [localThemes] = useLocalStorage('themes', []);

    const getQuestionCountString = (questionsCounts: Record<string, number> = {}) => {
        const count = questionsCounts[currentLocale] || questionsCounts.fr || 0;
        if (count) {
            return t('step', { count });
        }
        return undefined;
    };

    return (
        <>
            {scenarios.map((s) => (
                <ScenarioCard
                    key={s.id}
                    name={s.names[currentLocale] || s.names[Object.keys(s.names)[0]] || ''}
                    description={s.descriptions[currentLocale] || s.descriptions[Object.keys(s.descriptions)[0]] || ''}
                    questionsCount={getQuestionCountString(s.questionsCount)}
                    href="/create/2-questions"
                    onClick={async (event) => {
                        if (project && project.themeId === s.themeId && project.scenarioId === s.id && !projectId) {
                            return; // Go to the next page if the project is already created with the default link action
                        }

                        // Prevent navigation to the next page and create a new project
                        event.preventDefault();
                        const questions = await jsonFetcher<QuestionTemplate[]>(
                            `/api/questions-templates${serializeToQueryUrl({ scenarioId: s.id })}`,
                        );
                        // Create a new project with the selected scenario and selected theme
                        deleteFromLocalStorage('projectId');
                        setToLocalStorage('project', {
                            themeId: s.themeId,
                            themeName:
                                typeof s.themeId === 'number'
                                    ? themes?.find((theme) => theme.id === s.themeId)?.names[currentLocale] || ''
                                    : localThemes.find((theme) => theme.id === s.themeId)?.names[currentLocale] || '',
                            scenarioId: s.id,
                            scenarioName: s.names[currentLocale] || s.names[Object.keys(s.names)[0]] || '',
                            questions: questions.map((question, index) => ({
                                id: index,
                                question: question.question,
                                plans: [],
                            })),
                        });
                        router.push('/create/2-questions');
                    }}
                />
            ))}
        </>
    );
};
