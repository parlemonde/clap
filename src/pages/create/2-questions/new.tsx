import { useRouter } from 'next/router';
import React from 'react';

import { useCreatePlanMutation } from 'src/api/plans/plans.post';
import { useCreateQuestionMutation } from 'src/api/questions/questions.post';
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
import type { Project } from 'types/models/project.type';

const NewQuestion = () => {
    const router = useRouter();
    const { t, currentLocale } = useTranslation();
    const { project, questions, isLoading: isProjectLoading, updateProject } = useCurrentProject();
    const { theme, isLoading: isThemeLoading } = useTheme(project ? project.themeId : 0, {
        enabled: !isProjectLoading,
    });
    const { scenario } = useScenario(project ? project.scenarioId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });
    const { socket, connectTeacher, updateProject: updateProjectSocket } = useSocket();
    const { isCollaborationActive } = useCollaboration();

    const [question, setQuestion] = React.useState('');

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
                        sendToast({ message: t('unknown_error'), type: 'error' });
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
                                updateStoredProject({
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
                                updateStoredProject({
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
            updateStoredProject({
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

    const updateStoredProject = (data: Partial<Project>) => {
        const updatedProject = updateProject(data);
        if (isCollaborationActive && updatedProject) {
            updateProjectSocket(updatedProject);
        }
    };

    React.useEffect(() => {
        if (isCollaborationActive && socket.connected === false && project !== undefined && project.id) {
            connectTeacher(project);
        }
    }, [isCollaborationActive, socket, project]);

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
                <Form onSubmit={onCreateQuestion}>
                    <Field
                        name="question"
                        label={
                            <Title color="inherit" variant="h2">
                                {t('part2_add_question')}
                            </Title>
                        }
                        input={
                            <Input
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
                                marginTop="sm"
                            />
                        }
                        helperText={`${question.length}/280`}
                    />
                    <NextButton backHref={backUrl} type="submit" />
                </Form>
            </div>
            <Loader isLoading={createQuestionMutation.isLoading || createPlanMutation.isLoading} />
        </Container>
    );
};

export default NewQuestion;
