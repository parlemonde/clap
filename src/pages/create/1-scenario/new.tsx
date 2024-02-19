import { useRouter } from 'next/router';
import React from 'react';

import { useCreateScenarioMutation } from 'src/api/scenarios/scenarios.post';
import { useTheme } from 'src/api/themes/themes.get';
import { Container } from 'src/components/layout/Container';
import { Field, Form, Input, TextArea } from 'src/components/layout/Form';
import { Title } from 'src/components/layout/Typography';
import { NextButton } from 'src/components/navigation/NextButton';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { Loader } from 'src/components/ui/Loader';
import { sendToast } from 'src/components/ui/Toasts';
import { Trans } from 'src/components/ui/Trans';
import { useTranslation } from 'src/i18n/useTranslation';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';
import { useQueryId } from 'src/utils/useQueryId';

const NewScenario = () => {
    const router = useRouter();
    const { t, currentLocale } = useTranslation();
    const createScenarioMutation = useCreateScenarioMutation();

    const themeId = useQueryId('themeId');
    const { theme, isLoading: isThemeLoading } = useTheme(themeId);

    const [name, setName] = React.useState('');
    const [description, setDescription] = React.useState('');

    React.useEffect(() => {
        if (!theme && !isThemeLoading) {
            router.replace('/create');
        }
    }, [router, theme, isThemeLoading]);

    const onCreateScenario = () => {
        if (themeId === undefined || !name || name.trim().length === 0) {
            sendToast({ message: 'Le titre est obligatoire et ne doit pas être vide.', type: 'error' });
            return;
        }
        createScenarioMutation.mutate(
            {
                names: {
                    [currentLocale]: name.trim(),
                },
                descriptions: {
                    [currentLocale]: description.trim(),
                },
                themeId,
            },
            {
                onSuccess(newScenario) {
                    router.push(`/create/2-questions${serializeToQueryUrl({ themeId, scenarioId: newScenario.id })}`);
                },
                onError(error) {
                    console.error(error);
                    sendToast({ message: t('unknown_error'), type: 'error' });
                },
            },
        );
    };

    const backUrl = `/create/1-scenario${serializeToQueryUrl({ themeId })}`;
    return (
        <Container>
            <ThemeBreadcrumbs theme={theme} isLoading={isThemeLoading}></ThemeBreadcrumbs>
            <Steps activeStep={0} themeId={themeId} backHref={backUrl}></Steps>
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '2rem' }}>
                <Title color="primary" variant="h1" marginY="md">
                    <Inverted isRound>1</Inverted>{' '}
                    <Trans i18nKey="new_scenario_title">
                        Crée ton nouveau <Inverted>scénario</Inverted> !
                    </Trans>
                </Title>
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
            </div>
            <Loader isLoading={createScenarioMutation.isLoading} />
        </Container>
    );
};

export default NewScenario;
