import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React from 'react';

import { Typography, TextField } from '@mui/material';

import { useCreateScenarioMutation } from 'src/api/scenarios/scenarios.post';
import { useTheme } from 'src/api/themes/themes.get';
import { Loader } from 'src/components/layout/Loader';
import { NextButton } from 'src/components/navigation/NextButton';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';
import { useTranslation } from 'src/i18n/useTranslation';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';
import { useQueryId } from 'src/utils/useQueryId';

const NewScenario = () => {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const { t, currentLocale } = useTranslation();
    const createScenarioMutation = useCreateScenarioMutation();

    const themeId = useQueryId('themeId');
    const { theme, isLoading: isThemeLoading } = useTheme(themeId);

    const [name, setName] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [hasError, setHasError] = React.useState(false);

    React.useEffect(() => {
        if (!theme && !isThemeLoading) {
            router.replace('/create');
        }
    }, [router, theme, isThemeLoading]);

    const onCreateScenario = () => {
        if (themeId === undefined) {
            return;
        }
        if (!name) {
            setHasError(true);
            return;
        }
        createScenarioMutation.mutate(
            {
                names: {
                    [currentLocale]: name,
                },
                descriptions: {
                    [currentLocale]: description,
                },
                themeId,
            },
            {
                onSuccess(newScenario) {
                    router.push(`/create/2-questions${serializeToQueryUrl({ themeId, scenarioId: newScenario.id })}`);
                },
                onError(error) {
                    console.error(error);
                    enqueueSnackbar(t('unknown_error'), {
                        variant: 'error',
                    });
                },
            },
        );
    };

    const backUrl = `/create/1-scenario${serializeToQueryUrl({ themeId })}`;

    return (
        <div>
            <ThemeBreadcrumbs theme={theme} isLoading={isThemeLoading}></ThemeBreadcrumbs>
            <Steps activeStep={0} themeId={themeId} backHref={backUrl}></Steps>
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '2rem' }}>
                <Typography color="primary" variant="h1">
                    <Inverted round>1</Inverted>{' '}
                    <Trans i18nKey="new_scenario_title">
                        Crée ton nouveau <Inverted>scénario</Inverted> !
                    </Trans>
                </Typography>
                <Typography color="inherit" variant="h2">
                    <Trans i18nKey="new_scenario_title_label">
                        Choisis ton titre<span style={{ color: 'red' }}>*</span> :
                    </Trans>
                </Typography>
                <TextField
                    value={name}
                    onChange={(event) => {
                        setName(event.target.value.slice(0, 200));
                        setHasError(false);
                    }}
                    required
                    error={hasError}
                    className={hasError ? 'shake' : ''}
                    id="scenarioName"
                    placeholder={t('new_scenario_title_placeholder')}
                    helperText={`${name.length}/200`}
                    FormHelperTextProps={{ style: { textAlign: 'right' } }}
                    fullWidth
                    style={{ marginTop: '0.5rem' }}
                    variant="outlined"
                    color="secondary"
                    autoComplete="off"
                />
                <Typography color="inherit" variant="h2" style={{ marginTop: '1rem' }}>
                    {t('new_scenario_desc_label')}
                </Typography>
                <TextField
                    value={description}
                    onChange={(event) => {
                        setDescription(event.target.value.slice(0, 400));
                        setHasError(false);
                    }}
                    required
                    id="scenarioDescription"
                    multiline
                    placeholder={t('new_scenario_desc_placeholder')}
                    fullWidth
                    style={{ marginTop: '0.5rem' }}
                    variant="outlined"
                    helperText={`${description.length}/400`}
                    FormHelperTextProps={{ style: { textAlign: 'right' } }}
                    color="secondary"
                    autoComplete="off"
                />
                <NextButton backHref={backUrl} onNext={onCreateScenario} />
            </div>
            <Loader isLoading={createScenarioMutation.isLoading} />
        </div>
    );
};

export default NewScenario;
