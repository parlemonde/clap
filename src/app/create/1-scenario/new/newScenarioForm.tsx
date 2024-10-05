'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

import { createScenario } from 'src/actions/scenarios/create-scenario';
import { Form, Field, Input, TextArea } from 'src/components/layout/Form';
import { Title } from 'src/components/layout/Typography';
import { NextButton } from 'src/components/navigation/NextButton';
import { Loader } from 'src/components/ui/Loader';
import { sendToast } from 'src/components/ui/Toasts';
import { Trans } from 'src/components/ui/Trans';
import { useTranslation } from 'src/contexts/translationContext';
import { userContext } from 'src/contexts/userContext';
import { useLocalStorage } from 'src/hooks/useLocalStorage';
import type { LocalScenario } from 'src/hooks/useLocalStorage/local-storage';
import { serializeToQueryUrl } from 'src/utils/serialize-to-query-url';

type NewScenarioFormProps = {
    backUrl: string;
    themeId: string | number;
};
export const NewScenarioForm = ({ backUrl, themeId }: NewScenarioFormProps) => {
    const router = useRouter();
    const { user } = React.useContext(userContext);
    const { t, currentLocale } = useTranslation();

    const [name, setName] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [localScenarios, setLocalScenarios] = useLocalStorage('scenarios', []);

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
                router.push(`/create/2-questions${serializeToQueryUrl({ themeId, scenarioId: newScenario.id })}`);
            } else {
                sendToast({ message: t('unknown_error'), type: 'error' });
            }
            setIsLoading(false);
        } else {
            const nextId = Math.max(0, ...localScenarios.map((scenario) => Number(scenario.id.split('_')[1] || '0'))) + 1;
            const newScenario: LocalScenario = {
                id: `local_${nextId}`,
                userId: null,
                names: {
                    [currentLocale]: name,
                },
                descriptions: {
                    [currentLocale]: description,
                },
                isDefault: false,
                themeId,
            };
            setLocalScenarios([...localScenarios, newScenario]);
            router.push(`/create/2-questions${serializeToQueryUrl({ themeId, scenarioId: newScenario.id })}`);
        }
    };

    return (
        <>
            <Form onSubmit={onCreateScenario}>
                <Field
                    name="scenario_title"
                    label={
                        <Title color="inherit" variant="h2">
                            <Trans i18nKey="new_scenario_title_label">
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
                            placeholder={t('new_scenario_title_placeholder')}
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
                            {t('new_scenario_desc_label')}
                        </Title>
                    }
                    input={
                        <TextArea
                            id="scenario_description"
                            value={description}
                            onChange={(event) => {
                                setDescription(event.target.value.slice(0, 400));
                            }}
                            placeholder={t('new_scenario_desc_placeholder')}
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
