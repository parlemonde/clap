import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import { useDeleteQuestionMutation } from 'src/api/questions/questions.delete';
import { useReorderQuestionsMutation } from 'src/api/questions/questions.order';
import { useScenario } from 'src/api/scenarios/scenarios.get';
import { useTheme } from 'src/api/themes/themes.get';
import { QuestionCard } from 'src/components/create/QuestionCard';
import { SaveProjectModal } from 'src/components/create/SaveProjectModal';
import { Button } from 'src/components/layout/Button';
import { Container } from 'src/components/layout/Container';
import { Modal } from 'src/components/layout/Modal';
import { Title } from 'src/components/layout/Typography';
import { NextButton } from 'src/components/navigation/NextButton';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { Sortable } from 'src/components/ui/Sortable';
import { sendToast } from 'src/components/ui/Toasts';
import { Trans } from 'src/components/ui/Trans';
import { userContext } from 'src/contexts/userContext';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { useTranslation } from 'src/i18n/useTranslation';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';

const QuestionsPage = () => {
    const router = useRouter();
    const { t, currentLocale } = useTranslation();
    const { user } = React.useContext(userContext);
    const { project, questions, isLoading: isProjectLoading, updateProject } = useCurrentProject();
    const { theme, isLoading: isThemeLoading } = useTheme(project ? project.themeId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });
    const { scenario } = useScenario(project ? project.scenarioId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });
    const [deleteQuestionIndex, setDeleteQuestionIndex] = React.useState(-1);
    const [showSaveProjectModal, setShowSaveProjectModal] = React.useState(false);

    React.useEffect(() => {
        if (!project && !isProjectLoading) {
            router.replace('/create');
        }
    }, [router, project, isProjectLoading]);

    const deleteQuestionMutation = useDeleteQuestionMutation();
    const reorderQuestionsMutation = useReorderQuestionsMutation();

    const onDeleteQuestion = async () => {
        const newQuestions = [...questions];
        const [questionToDelete] = newQuestions.splice(deleteQuestionIndex, 1);
        if (questionToDelete !== undefined && project !== undefined && project.id !== 0) {
            try {
                await deleteQuestionMutation.mutateAsync({ questionId: questionToDelete.id });
            } catch (err) {
                console.error(err);
                sendToast({ message: t('unknown_error'), type: 'error' });
                return;
            }
        }
        updateProject({ questions: newQuestions });
        setDeleteQuestionIndex(-1);
    };

    const onReorderQuestions = (order: number[]) => {
        if (!project || project.id === 0) {
            return;
        }
        reorderQuestionsMutation.mutate(
            {
                order,
            },
            {
                onError(error) {
                    console.error(error);
                    sendToast({ message: t('unknown_error'), type: 'error' });
                },
            },
        );
    };

    return (
        <Container>
            <ThemeBreadcrumbs theme={theme} isLoading={isThemeLoading}></ThemeBreadcrumbs>
            <Steps
                activeStep={1}
                themeId={project ? project.themeId : undefined}
                scenarioName={scenario?.names?.[currentLocale] || undefined}
            ></Steps>
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '2rem' }}>
                <Title color="primary" marginY="md" variant="h1">
                    <Inverted isRound>2</Inverted>{' '}
                    <Trans i18nKey="part2_title">
                        Mes <Inverted>séquences</Inverted>
                    </Trans>
                </Title>
                <Title color="inherit" variant="h2">
                    {t('part2_desc')}
                </Title>
                <Link href={`/create/2-questions/new${serializeToQueryUrl({ projectId: project?.id || null })}`} passHref>
                    <Button as="a" label={t('add_question')} variant="outlined" color="secondary" marginTop="lg" isUpperCase={false}></Button>
                </Link>
                {!isProjectLoading && (
                    <Sortable
                        list={questions}
                        setList={(newQuestions) => {
                            updateProject({ questions: newQuestions });
                            onReorderQuestions(newQuestions.map((q) => q.id));
                        }}
                    >
                        {questions.map((q, index) => (
                            <QuestionCard
                                key={q.id}
                                projectId={project?.id || null}
                                question={q.question}
                                index={index}
                                onDelete={() => {
                                    setDeleteQuestionIndex(index);
                                }}
                                onIndexUp={
                                    index > 0
                                        ? () => {
                                              const newQuestions = [...questions];
                                              newQuestions.splice(index - 1, 0, newQuestions.splice(index, 1)[0]);
                                              updateProject({ questions: newQuestions });
                                              onReorderQuestions(newQuestions.map((q) => q.id));
                                          }
                                        : undefined
                                }
                                onIndexDown={
                                    index < questions.length - 1
                                        ? () => {
                                              const newQuestions = [...questions];
                                              newQuestions.splice(index + 1, 0, newQuestions.splice(index, 1)[0]);
                                              updateProject({ questions: newQuestions });
                                              onReorderQuestions(newQuestions.map((q) => q.id));
                                          }
                                        : undefined
                                }
                            />
                        ))}
                    </Sortable>
                )}
                <NextButton
                    onNext={() => {
                        if (project !== undefined && project.id === 0 && user !== null) {
                            setShowSaveProjectModal(true);
                        } else {
                            router.push(`/create/3-storyboard${serializeToQueryUrl({ projectId: project?.id || null })}`);
                        }
                    }}
                />
                <Modal
                    isOpen={deleteQuestionIndex !== -1}
                    onClose={() => {
                        setDeleteQuestionIndex(-1);
                    }}
                    onConfirm={onDeleteQuestion}
                    title={t('part2_delete_question_title')}
                    confirmLabel={t('delete')}
                    confirmLevel="error"
                    isLoading={deleteQuestionMutation.isLoading}
                >
                    {t('part2_delete_question_desc')} {questions[deleteQuestionIndex]?.question || ''} ?
                </Modal>
                <SaveProjectModal
                    isOpen={showSaveProjectModal}
                    onClose={(newProjectId?: number) => {
                        setShowSaveProjectModal(false);
                        router.push(`/create/3-storyboard${serializeToQueryUrl({ projectId: newProjectId || null })}`);
                    }}
                />
            </div>
        </Container>
    );
};

export default QuestionsPage;
