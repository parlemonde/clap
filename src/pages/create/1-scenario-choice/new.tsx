import { useRouter } from 'next/router';
import React, { useContext, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import ArrowForwardIcon from '@mui/icons-material/ArrowForwardIos';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Inverted } from 'src/components/Inverted';
import { Trans } from 'src/components/Trans';
import { Steps } from 'src/components/create/Steps';
import { ThemeLink } from 'src/components/create/ThemeLink';
import { useTranslation } from 'src/i18n/useTranslation';
import { ProjectServiceContext } from 'src/services/useProject';
import { useScenarioRequests } from 'src/services/useScenarios';
import { debounce } from 'src/util';

const NewScenario: React.FunctionComponent = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { t, currentLocale } = useTranslation();
    const { createScenario } = useScenarioRequests();
    const { mutateAsync } = useMutation(createScenario);
    const { project, updateProject } = useContext(ProjectServiceContext);
    const [newScenario, setNewScenario] = useState({
        name: '',
        description: '',
    });
    const [hasError, setHasError] = useState(false);
    const [descHasError, setDescHasError] = useState(false);
    const themeId = project.theme?.id ?? -1;

    const handleSubmit = async (event: React.MouseEvent) => {
        event.preventDefault();
        if (newScenario.name.length === 0) {
            setHasError(true);
            setTimeout(() => {
                setHasError(false);
            }, 1000);
        }
        try {
            const scenario = await mutateAsync({
                newScenario: {
                    id: 0,
                    languageCode: currentLocale,
                    name: newScenario.name,
                    isDefault: false,
                    description: newScenario.description,
                    user: null,
                    questionsCount: 0,
                    themeId: themeId,
                },
            });
            if (scenario === null) {
                // TODO
                return;
            }
            queryClient.invalidateQueries('scenarios');
            updateProject({
                scenario,
                questions: null,
            });
            router.push(`/create/2-questions-choice`);
        } catch (e) {
            // TODO
        }
    };

    const setDescError = debounce(
        () => {
            setDescHasError(true);
            setTimeout(() => {
                setDescHasError(false);
            }, 1000);
        },
        1000,
        true,
    );

    const handleChange = (inputName: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        switch (inputName) {
            default:
                break;
            case 'NAME':
                setNewScenario({
                    ...newScenario,
                    name: event.target.value.slice(0, 50),
                });
                break;
            case 'DESCRIPTION':
                if (event.target.value.length > 280) {
                    setDescError();
                }
                setNewScenario({
                    ...newScenario,
                    description: event.target.value.slice(0, 280),
                });
                break;
        }
    };

    const handleBack = (event: React.MouseEvent) => {
        event.preventDefault();
        router.push(`/create/1-scenario-choice`);
    };

    React.useCallback(() => {
        if (themeId === -1) {
            router.push(`/create/1-scenario-choice`);
        }
    }, [router, themeId]);

    return (
        <div>
            <ThemeLink />
            <Steps activeStep={0} />
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '2rem' }}>
                <div
                    style={{
                        maxWidth: '1000px',
                        margin: 'auto',
                        paddingBottom: '2rem',
                    }}
                >
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
                        <div>
                            <TextField
                                value={newScenario.name || ''}
                                onChange={handleChange('NAME')}
                                required
                                error={hasError}
                                className={hasError ? 'shake' : ''}
                                id="scenarioName"
                                placeholder={t('new_scenario_title_placeholder')}
                                fullWidth
                                style={{ marginTop: '0.5rem' }}
                                variant="outlined"
                                color="secondary"
                                autoComplete="off"
                            />
                        </div>
                    </Typography>

                    <Typography color="inherit" variant="h2" style={{ marginTop: '1rem' }}>
                        {t('new_scenario_desc_label')}
                        <div>
                            <TextField
                                value={newScenario.description || ''}
                                onChange={handleChange('DESCRIPTION')}
                                required
                                id="scenarioDescription"
                                multiline
                                placeholder={t('new_scenario_desc_placeholder')}
                                fullWidth
                                style={{ marginTop: '0.5rem' }}
                                variant="outlined"
                                color="secondary"
                                autoComplete="off"
                                error={descHasError}
                                className={descHasError ? 'shake' : ''}
                            />
                            <FormHelperText
                                id="component-helper-text"
                                style={{
                                    marginLeft: '0.2rem',
                                    marginTop: '0.2rem',
                                    color: descHasError ? 'red' : 'inherit',
                                }}
                            >
                                {newScenario.description.length || 0}/280
                            </FormHelperText>
                        </div>
                    </Typography>
                    <Typography color="inherit" variant="h2" style={{ marginTop: '1rem' }}>
                        <Box sx={{ display: { xs: 'none', md: 'block' } }} style={{ width: '100%', textAlign: 'right' }}>
                            <Button
                                component="a"
                                variant="outlined"
                                color="secondary"
                                style={{ marginRight: '1rem' }}
                                href={`/create/1-scenario-choice?themeId=${themeId}`}
                                onClick={handleBack}
                            >
                                {t('cancel')}
                            </Button>
                            <Button variant="contained" color="secondary" onClick={handleSubmit} endIcon={<ArrowForwardIcon />}>
                                {t('next')}
                            </Button>
                        </Box>
                        <Button
                            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
                            variant="contained"
                            color="secondary"
                            style={{ width: '100%', marginTop: '2rem' }}
                            onClick={handleSubmit}
                        >
                            {t('next')}
                        </Button>
                    </Typography>
                </div>
            </div>
        </div>
    );
};

export default NewScenario;
