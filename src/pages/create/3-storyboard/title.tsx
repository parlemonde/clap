import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React from 'react';

import { Typography } from '@mui/material';

import { useUpdateQuestionMutation } from 'src/api/questions/questions.put';
import { useScenario } from 'src/api/scenarios/scenarios.get';
import { useTheme } from 'src/api/themes/themes.get';
import { TitleCanvas } from 'src/components/TitleCanvas';
import { Loader } from 'src/components/layout/Loader';
import { NextButton } from 'src/components/navigation/NextButton';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { useTranslation } from 'src/i18n/useTranslation';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';
import { useQueryNumber } from 'src/utils/useQueryId';
import type { Title } from 'types/models/title.type';

const EMPTY_TITLE: Title = {
    text: '',
    duration: 3000, // 3 seconds
    style: '{}',
};

const TitlePlan = () => {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const { t, currentLocale } = useTranslation();
    const { project, questions, isLoading: isProjectLoading, updateProject } = useCurrentProject();
    const { theme, isLoading: isThemeLoading } = useTheme(project ? project.themeId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });
    const { scenario } = useScenario(project ? project.scenarioId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });

    const questionIndex = useQueryNumber('question') ?? -1;
    const sequence = React.useMemo(() => (questionIndex !== -1 ? questions[questionIndex] : undefined), [questions, questionIndex]);

    const [title, setTitle] = React.useState(EMPTY_TITLE);
    React.useEffect(() => {
        if (!sequence) {
            setTitle(EMPTY_TITLE);
            return;
        }
        setTitle(
            sequence.title || {
                ...EMPTY_TITLE,
                text: sequence.question,
            },
        );
    }, [sequence]);

    const backUrl = `/create/3-storyboard${serializeToQueryUrl({ projectId: project?.id || null })}`;
    const updateQuestionMutation = useUpdateQuestionMutation();
    const onUpdateQuestion = async () => {
        if (project === undefined || questionIndex === -1) {
            return;
        }
        if (project.id !== 0) {
            try {
                await updateQuestionMutation.mutateAsync({
                    questionId: questions[questionIndex].id,
                    title,
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
            title,
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
                activeStep={2}
                themeId={project ? project.themeId : undefined}
                scenarioName={scenario?.names?.[currentLocale] || undefined}
                backHref={backUrl}
            ></Steps>
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '2rem' }}>
                <Typography color="primary" variant="h1">
                    <Inverted round>3</Inverted> {t('part3_edit_title', { planNumber: questionIndex + 1 })}
                </Typography>
                <Typography variant="h2">
                    <span>{t('part3_question')}</span> {sequence?.question || ''}
                </Typography>
                <Typography>
                    <span>{t('part3_edit_title_desc')}</span>
                </Typography>
                {title !== null && <TitleCanvas title={title} onChange={setTitle} />}

                <NextButton label={t('continue')} backHref={backUrl} onNext={onUpdateQuestion} />
            </div>
            <Loader isLoading={updateQuestionMutation.isLoading} />
        </div>
    );
};

export default TitlePlan;
