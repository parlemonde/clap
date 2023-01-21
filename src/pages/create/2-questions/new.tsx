import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React from 'react';

import { Typography, TextField } from '@mui/material';

import { useCreatePlanMutation } from 'src/api/plans/plans.post';
import { useCreateQuestionMutation } from 'src/api/questions/questions.post';
import { useScenario } from 'src/api/scenarios/scenarios.get';
import { useTheme } from 'src/api/themes/themes.get';
import { Loader } from 'src/components/layout/Loader';
import { NextButton } from 'src/components/navigation/NextButton';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { useTranslation } from 'src/i18n/useTranslation';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';

const NewQuestion = () => {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const { t, currentLocale } = useTranslation();
    const { project, questions, isLoading: isProjectLoading, updateProject } = useCurrentProject();
    const { theme, isLoading: isThemeLoading } = useTheme(project ? project.themeId : 0, {
        enabled: !isProjectLoading,
    });
    const { scenario } = useScenario(project ? project.scenarioId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });

    const [question, setQuestion] = React.useState('');
    const [hasError, setHasError] = React.useState(false);

    const createQuestionMutation = useCreateQuestionMutation();
    const createPlanMutation = useCreatePlanMutation();

    const backUrl = `/create/2-questions${serializeToQueryUrl({
        projectId: project?.id || null,
    })}`;

    React.useEffect(() => {
        if (!project && !isProjectLoading) {
            router.replace('/create');
        }
    }, [router, project, isProjectLoading]);

    const onCreateQuestion = () => {
        if (project === undefined) {
            return;
        }
        if (!question) {
            setHasError(true);
            return;
        }

        if (project.id !== 0) {
            createQuestionMutation.mutate(
                {
                    index: questions.length,
                    question,
                    projectId: project.id,
                },
                {
                    onError(error) {
                        console.error(error);
                        enqueueSnackbar(t('unknown_error'), {
                            variant: 'error',
                        });
                    },
                    onSuccess(newQuestion) {
                        createPlanMutation
                            .mutateAsync({
                                questionId: newQuestion.id,
                                description: '',
                                index: 0,
                                duration: 3000, // 3 seconds
                            })
                            .then((plan) => {
                                updateProject({
                                    questions: [
                                        ...questions,
                                        {
                                            ...newQuestion,
                                            plans: [plan],
                                        },
                                    ],
                                });
                            })
                            .catch(() => {
                                updateProject({
                                    questions: [...questions, newQuestion],
                                });
                            })
                            .finally(() => {
                                router.push(backUrl);
                            });
                    },
                },
            );
        } else {
            updateProject({
                questions: [
                    ...questions,
                    {
                        id: Math.max(...questions.map((q) => q.id), 0) + 1,
                        index: questions.length,
                        question,
                        projectId: project.id,
                        title: null,
                        voiceOff: null,
                        voiceOffBeginTime: 0,
                        soundUrl: null,
                        soundVolume: 100,
                        plans: [
                            {
                                id: 0,
                                description: '',
                                index: 0,
                                imageUrl: '',
                                duration: 3000, // 3 seconds
                            },
                        ],
                    },
                ],
            });
            router.push(backUrl);
        }
    };

    return (
        <div>
            <ThemeBreadcrumbs theme={theme} isLoading={isThemeLoading}></ThemeBreadcrumbs>
            <Steps
                activeStep={1}
                themeId={project ? project.themeId : undefined}
                backHref={backUrl}
                scenarioName={scenario?.names?.[currentLocale] || undefined}
            ></Steps>
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '2rem' }}>
                <Typography color="primary" variant="h1">
                    <Inverted round>2</Inverted>{' '}
                    <Trans i18nKey="part2_title">
                        Mes <Inverted>séquences</Inverted>
                    </Trans>
                </Typography>
                <Typography color="inherit" variant="h2">
                    {t('part2_add_question')}
                </Typography>
                <TextField
                    value={question}
                    onChange={(event) => {
                        setQuestion(event.target.value.slice(0, 280));
                        setHasError(false);
                    }}
                    required
                    error={hasError}
                    className={hasError ? 'shake' : ''}
                    id="question"
                    placeholder={t('part2_add_question_placeholder')}
                    helperText={`${question.length}/280`}
                    FormHelperTextProps={{ style: { textAlign: 'right' } }}
                    fullWidth
                    style={{ marginTop: '0.5rem' }}
                    variant="outlined"
                    color="secondary"
                    autoComplete="off"
                />
                <NextButton backHref={backUrl} onNext={onCreateQuestion} />
            </div>
            <Loader isLoading={createQuestionMutation.isLoading || createPlanMutation.isLoading} />
        </div>
    );
};

export default NewQuestion;
