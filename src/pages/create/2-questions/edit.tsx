import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React from 'react';

import { Typography, TextField } from '@mui/material';

import { useUpdateQuestionMutation } from 'src/api/questions/questions.put';
import { useScenario } from 'src/api/scenarios/scenarios.get';
import { useTheme } from 'src/api/themes/themes.get';
import { Loader } from 'src/components/layout/Loader';
import { NextButton } from 'src/components/navigation/NextButton';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';
import { projectContext } from 'src/contexts/projectContext';
import { useTranslation } from 'src/i18n/useTranslation';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';
import { useQueryNumber } from 'src/utils/useQueryId';

const EditQuestion = () => {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const { t, currentLocale } = useTranslation();
    const { project, questions, isLoading: isProjectLoading, updateProject } = React.useContext(projectContext);
    const { theme, isLoading: isThemeLoading } = useTheme(project ? project.themeId : 0, {
        enabled: !isProjectLoading,
    });
    const { scenario } = useScenario(project ? project.scenarioId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });
    const questionIndex = useQueryNumber('question') ?? -1;

    const [question, setQuestion] = React.useState('');
    const [hasError, setHasError] = React.useState(false);

    React.useEffect(() => {
        setQuestion(questionIndex >= 0 ? questions[questionIndex]?.question || '' : '');
    }, [questions, questionIndex]);

    React.useEffect(() => {
        if (!project && !isProjectLoading) {
            router.replace('/create');
        }
    }, [router, project, isProjectLoading]);

    const updateQuestionMutation = useUpdateQuestionMutation();

    const backUrl = `/create/2-questions${serializeToQueryUrl({
        themeId: project ? project.themeId : undefined,
        scenarioId: project ? project.scenarioId : undefined,
    })}`;

    const onUpdateQuestion = async () => {
        if (project === undefined || questionIndex === -1) {
            return;
        }
        if (!question) {
            setHasError(true);
            return;
        }

        if (project.id !== 0) {
            try {
                await updateQuestionMutation.mutateAsync({
                    questionId: questions[questionIndex].id,
                    question,
                });
            } catch (err) {
                console.error(err);
                enqueueSnackbar(t('unknown_error'), {
                    variant: 'error',
                });
                return;
            }
        }
        const newQuestions = [...questions];
        newQuestions[questionIndex] = {
            ...newQuestions[questionIndex],
            question,
        };
        updateProject({
            questions: newQuestions,
        });
        router.push(backUrl);
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
                    {t('part2_edit_question')}
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
                <NextButton backHref={backUrl} onNext={onUpdateQuestion} />
            </div>
            <Loader isLoading={updateQuestionMutation.isLoading} />
        </div>
    );
};

export default EditQuestion;
