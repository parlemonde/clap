'use client';

import { useRouter } from 'next/navigation';
import { useExtracted, useLocale } from 'next-intl';
import React from 'react';
import useSWR from 'swr';

import { Form, Field, Input, TextArea } from '@frontend/components/layout/Form';
import { Title } from '@frontend/components/layout/Typography';
import { NextButton } from '@frontend/components/navigation/NextButton';
import { Loader } from '@frontend/components/ui/Loader';
import { sendToast } from '@frontend/components/ui/Toasts';
import { userContext } from '@frontend/contexts/userContext';
import { useCurrentProject } from '@frontend/hooks/useCurrentProject';
import { useLocalStorage } from '@frontend/hooks/useLocalStorage';
import { isLocalScenario, isLocalTheme, type LocalScenario } from '@frontend/hooks/useLocalStorage/local-storage';
import { jsonFetcher } from '@lib/json-fetcher';
import type { Scenario } from '@server/database/schemas/scenarios';
import type { Theme } from '@server/database/schemas/themes';
import { createScenario } from '@server-actions/scenarios/create-scenario';

type NewScenarioFormProps = {
    backUrl: string;
    themeId: string | number;
};
export const NewScenarioForm = ({ backUrl, themeId }: NewScenarioFormProps) => {
    const router = useRouter();
    const user = React.useContext(userContext);

    const tx = useExtracted('create.1-scenario.new.newScenarioForm');
    const commonT = useExtracted('common');
    const currentLocale = useLocale();

    const { setProjectData } = useCurrentProject();

    const { data: themes } = useSWR<Theme[]>('/api/themes', jsonFetcher);
    const [localThemes] = useLocalStorage('themes', []);

    const [name, setName] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [localScenarios, setLocalScenarios] = useLocalStorage('scenarios', []);

    const createNewProject = (scenario: Scenario | LocalScenario) => {
        const theme =
            typeof scenario.themeId === 'number'
                ? themes?.find((theme) => theme.id === scenario.themeId)
                : localThemes.find((theme) => theme.id === scenario.themeId);
        setProjectData({
            themeId: scenario.themeId,
            themeName:
                theme && isLocalTheme(theme) ? theme.name : theme ? theme.names[currentLocale] || theme.names[Object.keys(theme.names)[0]] || '' : '',
            scenarioId: scenario.id,
            scenarioName: isLocalScenario(scenario)
                ? scenario.name
                : scenario.names[currentLocale] || scenario.names[Object.keys(scenario.names)[0]] || '',
            questions: [],
        });
    };

    const onCreateScenario = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (user && typeof themeId === 'number') {
            setIsLoading(true);
            const newScenario = await createScenario({
                name,
                description,
                themeId,
            });
            if (newScenario) {
                createNewProject(newScenario);
                router.push('/create/2-questions');
            } else {
                sendToast({ message: commonT('Une erreur est survenue...'), type: 'error' });
            }
            setIsLoading(false);
        } else {
            const nextId = Math.max(0, ...localScenarios.map((scenario) => Number(scenario.id.split('_')[1] || '0'))) + 1;
            const newScenario: LocalScenario = {
                id: `local_${nextId}`,
                name,
                description,
                themeId,
            };
            setLocalScenarios([...localScenarios, newScenario]);
            createNewProject(newScenario);
            router.push('/create/2-questions');
        }
    };

    return (
        <>
            <Form onSubmit={onCreateScenario}>
                <Field
                    name="scenario_title"
                    label={
                        <Title color="inherit" variant="h2">
                            {tx.rich('Choisis ton titre<required>*</required> :', {
                                required: (chunks) => <span style={{ color: 'red' }}>{chunks}</span>,
                            })}
                        </Title>
                    }
                    input={
                        <Input
                            id="scenario_title"
                            value={name}
                            onChange={(event) => {
                                setName(event.target.value.slice(0, 200));
                            }}
                            required
                            placeholder={tx('Mon scénario')}
                            isFullWidth
                            marginTop="sm"
                            color="secondary"
                            autoComplete="off"
                        />
                    }
                    helperText={`${name.length}/200`}
                />
                <Field
                    marginTop="lg"
                    name="scenario_description"
                    label={
                        <Title color="inherit" variant="h2">
                            {tx('Fais en une rapide description :')}
                        </Title>
                    }
                    input={
                        <TextArea
                            id="scenario_description"
                            value={description}
                            onChange={(event) => {
                                setDescription(event.target.value.slice(0, 400));
                            }}
                            placeholder={tx('Ma description')}
                            isFullWidth
                            style={{ marginTop: '0.5rem' }}
                            color="secondary"
                            autoComplete="off"
                            marginTop="sm"
                        />
                    }
                    helperText={`${description.length}/400`}
                />
                <NextButton backHref={backUrl} type="submit" />
            </Form>
            <Loader isLoading={isLoading} />
        </>
    );
};
