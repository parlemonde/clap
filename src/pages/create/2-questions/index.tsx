import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import QRCode from 'react-qr-code';

import { useUpdateProjectMutation } from 'src/api/projects/projects.put';
import { useDeleteQuestionMutation } from 'src/api/questions/questions.delete';
import { useReorderQuestionsMutation } from 'src/api/questions/questions.order';
import { useUpdateQuestionMutation } from 'src/api/questions/questions.put';
import { useScenario } from 'src/api/scenarios/scenarios.get';
import { useTheme } from 'src/api/themes/themes.get';
import { StatusModal } from 'src/components/collaboration/StatusModal';
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
import { useCollaboration } from 'src/hooks/useCollaboration';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { useSocket } from 'src/hooks/useSocket';
import { useTranslation } from 'src/i18n/useTranslation';
import { COLORS } from 'src/utils/colors';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';
import type { Question, QuestionStatus } from 'types/models/question.type';

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
    const { stopCollaboration, updateProject: updateProjectSocket, connectTeacher } = useSocket();
    const { isCollaborationActive } = useCollaboration();
    const [deleteQuestionIndex, setDeleteQuestionIndex] = React.useState(-1);
    const [showSaveProjectModal, setShowSaveProjectModal] = React.useState(false);
    const [showQRCode, setShowQRCode] = React.useState<boolean | null>(null);
    const [joinCode, setJoinCode] = React.useState<number | null>(null);
    const [showStatusModal, setShowStatusModal] = React.useState(false);
    const [selectedQuestion, setSelectedQuestion] = React.useState<Question | undefined>(undefined);

    const styleList = {
        margin: '40px 0',
        padding: '0px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        columnGap: '20px',
        flexWrap: 'wrap',
        rowGap: '50px',
    };

    React.useEffect(() => {
        if (!project && !isProjectLoading) {
            router.replace('/create');
        }
    }, [router, project, isProjectLoading]);

    React.useEffect(() => {
        if (isCollaborationActive && project !== undefined && showQRCode === null) {
            startCollaborationMode();
        }
    }, [isCollaborationActive, project, showQRCode]);

    const deleteQuestionMutation = useDeleteQuestionMutation();
    const reorderQuestionsMutation = useReorderQuestionsMutation();
    const updateProjectMutation = useUpdateProjectMutation();

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
        const updatedProject = updateProject({ questions: newQuestions });
        if (isCollaborationActive && updatedProject) {
            updateProjectSocket(updatedProject);
        }
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

    const startCollaborationMode = async () => {
        if (project) {
            const code = project.joinCode || Math.floor(Math.random() * 1000000);
            setJoinCode(code);
            await updateProjectMutation.mutateAsync({
                projectId: project.id,
                isCollaborationActive: true,
                joinCode: code,
            });
            setShowQRCode(true);
            connectTeacher(project);
        }
    };
    const stopCollaborationMode = async () => {
        if (project) {
            setJoinCode(null);
            setShowQRCode(false);
            await updateProjectMutation.mutateAsync({
                projectId: project.id,
                isCollaborationActive: false,
                joinCode,
            });
            stopCollaboration(project);
        }
    };

    type onConfirmData = {
        question: Question;
        status?: QuestionStatus;
    };
    const updateSequenceMutation = useUpdateQuestionMutation();
    const updateStatus = async ({ question, status }: onConfirmData) => {
        try {
            await updateSequenceMutation.mutateAsync({
                questionId: question.id,
                status: status !== undefined ? status : question.status,
            });
            // Update projects
            const newQuestions = [...questions];
            newQuestions[question.index] = {
                ...newQuestions[question.index],
                status,
            };
            const updatedProject = updateProject({ questions: newQuestions });
            if (updatedProject) {
                updateProjectSocket(updatedProject);
            }
        } catch (err) {
            console.error(err);
            sendToast({ message: t('unknown_error'), type: 'error' });
        }
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
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                    <Link href={`/create/2-questions/new${serializeToQueryUrl({ projectId: project?.id || null })}`} passHref legacyBehavior>
                        <Button as="a" label={t('add_question')} variant="outlined" color="secondary" marginTop="lg" isUpperCase={false}></Button>
                    </Link>
                    {project && project.id !== 0 && (
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <Button
                                as="button"
                                variant="contained"
                                color="secondary"
                                marginTop="lg"
                                style={{
                                    textTransform: 'none',
                                    marginLeft: '2rem',
                                }}
                                onClick={() => (showQRCode ? stopCollaborationMode() : startCollaborationMode())}
                                label={t(`collaboration_${showQRCode ? 'stop' : 'start'}`)}
                            ></Button>
                            {joinCode && (
                                <p style={{ marginLeft: '24px', marginTop: '24px' }}>
                                    {t('collaboration_join_code')} : <b>{joinCode}</b>
                                </p>
                            )}
                        </div>
                    )}
                </div>
                {!isProjectLoading && (
                    <Sortable
                        list={questions}
                        setList={(newQuestions) => {
                            const updatedProject = updateProject({ questions: newQuestions });
                            if (isCollaborationActive && updatedProject) {
                                updateProjectSocket(updatedProject);
                            }
                            onReorderQuestions(newQuestions.map((q) => q.id));
                        }}
                        style={isCollaborationActive ? styleList : {}}
                    >
                        {questions.map((q, index) => (
                            <div key={q.id} style={{ width: isCollaborationActive ? '400px' : 'auto' }}>
                                <QuestionCard
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
                                    onEditStatus={
                                        isCollaborationActive
                                            ? () => {
                                                  setSelectedQuestion(q);
                                                  setShowStatusModal(true);
                                              }
                                            : undefined
                                    }
                                />
                                {showQRCode && user && project && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-evenly',
                                            alignItems: 'center',
                                            flexDirection: index % 2 === 0 ? 'row' : 'row-reverse',
                                        }}
                                    >
                                        <div
                                            style={{
                                                height: 'auto',
                                                maxWidth: 200,
                                                width: '100%',
                                                border: `5px solid ${COLORS[index]}`,
                                                padding: '10px 10px 7px 10px',
                                            }}
                                        >
                                            <QRCode
                                                size={256}
                                                style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                                                value={`{ "teacherId": ${user.id}, "sequencyId": ${q.id}, "projectId": ${project.id} }`}
                                                viewBox={`0 0 256 256`}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
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
                {selectedQuestion && (
                    <StatusModal
                        isOpen={showStatusModal}
                        onClose={() => setShowStatusModal(false)}
                        question={selectedQuestion}
                        onConfirm={updateStatus}
                    />
                )}
            </div>
        </Container>
    );
};

export default QuestionsPage;
