import { useRouter } from 'next/router';
import React from 'react';

import { useUpdateQuestionMutation } from 'src/api/questions/questions.put';
import { useScenario } from 'src/api/scenarios/scenarios.get';
import { useTheme } from 'src/api/themes/themes.get';
import { Container } from 'src/components/layout/Container';
import { Field, Form, Input } from 'src/components/layout/Form';
import { Title } from 'src/components/layout/Typography';
import { NextButton } from 'src/components/navigation/NextButton';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { Loader } from 'src/components/ui/Loader';
import { sendToast } from 'src/components/ui/Toasts';
import { Trans } from 'src/components/ui/Trans';
import { useCollaboration } from 'src/hooks/useCollaboration';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { useSocket } from 'src/hooks/useSocket';
import { useTranslation } from 'src/i18n/useTranslation';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';
import { useQueryNumber } from 'src/utils/useQueryId';

const EditQuestion = () => {
    const router = useRouter();
    const { t, currentLocale } = useTranslation();
    const { project, questions, isLoading: isProjectLoading, updateProject } = useCurrentProject();
    const { theme, isLoading: isThemeLoading } = useTheme(project ? project.themeId : 0, {
        enabled: !isProjectLoading,
    });
    const { scenario } = useScenario(project ? project.scenarioId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });
    const questionIndex = useQueryNumber('question') ?? -1;
    const { socket, connectTeacher, updateProject: updateProjectSocket } = useSocket();
    const { isCollaborationActive } = useCollaboration();

    const [question, setQuestion] = React.useState('');

    React.useEffect(() => {
        setQuestion(questionIndex >= 0 ? questions[questionIndex]?.question || '' : '');
    }, [questions, questionIndex]);

    React.useEffect(() => {
        if (!project && !isProjectLoading) {
            router.replace('/create');
        }
    }, [router, project, isProjectLoading]);

    React.useEffect(() => {
        if (isCollaborationActive && socket.connected === false && project !== undefined && project.id) {
            connectTeacher(project);
        }
    }, [isCollaborationActive, socket, project]);

    const updateQuestionMutation = useUpdateQuestionMutation();

    const backUrl = `/create/2-questions${serializeToQueryUrl({
        projectId: project?.id || null,
    })}`;

    const onUpdateQuestion = async () => {
        if (project === undefined || questionIndex === -1) {
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
                sendToast({ message: t('unknown_error'), type: 'error' });
                return;
            }
        }
        const newQuestions = [...questions];
        newQuestions[questionIndex] = {
            ...newQuestions[questionIndex],
            question,
        };
        const updatedProject = updateProject({
            questions: newQuestions,
        });
        if (isCollaborationActive && updatedProject) {
            updateProjectSocket(updatedProject);
        }
        router.push(backUrl);
    };

    return (
        <Container>
            <ThemeBreadcrumbs theme={theme} isLoading={isThemeLoading}></ThemeBreadcrumbs>
            <Steps
                activeStep={1}
                themeId={project ? project.themeId : undefined}
                backHref={backUrl}
                scenarioName={scenario?.names?.[currentLocale] || undefined}
            ></Steps>
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '2rem' }}>
                <Title color="primary" variant="h1" marginY="md">
                    <Inverted isRound>2</Inverted>{' '}
                    <Trans i18nKey="part2_title">
                        Mes <Inverted>séquences</Inverted>
                    </Trans>
                </Title>
                <Form onSubmit={onUpdateQuestion}>
                    <Field
                        name="question"
                        label={
                            <Title color="inherit" variant="h2">
                                {t('part2_edit_question')}
                            </Title>
                        }
                        input={
                            <Input
                                marginTop="sm"
                                value={question}
                                onChange={(event) => {
                                    setQuestion(event.target.value.slice(0, 280));
                                }}
                                required
                                id="question"
                                placeholder={t('part2_add_question_placeholder')}
                                isFullWidth
                                color="secondary"
                                autoComplete="off"
                            />
                        }
                        helperText={`${question.length}/280`}
                    />
                    <NextButton backHref={backUrl} type="submit" />
                </Form>
            </div>
            <Loader isLoading={updateQuestionMutation.isLoading} />
        </Container>
    );
};

export default EditQuestion;
