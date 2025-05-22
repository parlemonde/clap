'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import useSWR from 'swr';

import { createScenario } from 'src/actions/scenarios/create-scenario';
import { Form, Field, Input, TextArea } from 'src/components/layout/Form';
import { Title } from 'src/components/layout/Typography';
import { NextButton } from 'src/components/navigation/NextButton';
import { Loader } from 'src/components/ui/Loader';
import { sendToast } from 'src/components/ui/Toasts';
import { Trans } from 'src/components/ui/Trans';
import { useTranslation } from 'src/contexts/translationContext';
import { userContext } from 'src/contexts/userContext';
import type { Scenario } from 'src/database/schemas/scenarios';
import type { Theme } from 'src/database/schemas/themes';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { useLocalStorage } from 'src/hooks/useLocalStorage';
import { isLocalScenario, isLocalTheme, type LocalScenario } from 'src/hooks/useLocalStorage/local-storage';
import { jsonFetcher } from 'src/lib/json-fetcher';

type NewScenarioFormProps = {
    backUrl: string;
    themeId: string | number;
};
export const NewScenarioForm = ({ backUrl, themeId }: NewScenarioFormProps) => {
    const router = useRouter();
    const { user } = React.useContext(userContext);
    const { t, currentLocale } = useTranslation();

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
                sendToast({ message: t('common.errors.unknown'), type: 'error' });
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
                            <Trans i18nKey="1_new_scenario_page.title_field.label">
                                Choisis ton titre<span style={{ color: 'red' }}>*</span> :
                            </Trans>
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
                            placeholder={t('1_new_scenario_page.title_field.placeholder')}
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
                            {t('1_new_scenario_page.desc_field.label')}
                        </Title>
                    }
                    input={
                        <TextArea
                            id="scenario_description"
                            value={description}
                            onChange={(event) => {
                                setDescription(event.target.value.slice(0, 400));
                            }}
                            placeholder={t('1_new_scenario_page.desc_field.placeholder')}
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
