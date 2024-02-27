import { PlusIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/router';
import React from 'react';

import { type GetPDFParams, getProjectPdf } from '../../../api/projects/projects.pdf';
import { Button } from '../../../components/layout/Button';
import styles from '../../../components/navigation/NextButton/next-button.module.scss';
import { userContext } from '../../../contexts/userContext';
import PictureAsPdf from '../../../svg/pdf.svg';
import { useDeletePlanMutation } from 'src/api/plans/plans.delete';
import { useCreatePlanMutation } from 'src/api/plans/plans.post';
import { useUpdateQuestionMutation } from 'src/api/questions/questions.put';
import { useScenario } from 'src/api/scenarios/scenarios.get';
import { useTheme } from 'src/api/themes/themes.get';
import { ButtonShowFeedback } from 'src/components/collaboration/ButtonShowFeedback';
import { FeedbackModal } from 'src/components/collaboration/FeedbackModal';
import { FormFeedback } from 'src/components/collaboration/FormFeedback';
import { GroupColorPill } from 'src/components/collaboration/GroupColorPill';
import { NextStepButton } from 'src/components/collaboration/NextStepButton';
import { PlanCard } from 'src/components/create/PlanCard';
import { TitleCard } from 'src/components/create/TitleCard';
import { IconButton } from 'src/components/layout/Button/IconButton';
import { CircularProgress } from 'src/components/layout/CircularProgress';
import { Container } from 'src/components/layout/Container';
import { Modal } from 'src/components/layout/Modal';
import { Tooltip } from 'src/components/layout/Tooltip/Tooltip';
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
import { COLORS } from 'src/utils/colors';
import { getFromLocalStorage } from 'src/utils/local-storage';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';
import type { Plan } from 'types/models/plan.type';
import type { Question } from 'types/models/question.type';
import { QuestionStatus } from 'types/models/question.type';
import { UserType } from 'types/models/user.type';

type SequenceProps = {
    projectId: number | null;
    isSavedProject?: boolean;
    sequence: Question;
    sequenceIndex: number;
    planStartIndex: number;
    onUpdateSequence(newSequence: Partial<Question>): void;
    isStudent?: boolean;
    isCollaborationActive?: boolean;
};
const Scenario = ({
    projectId,
    isSavedProject,
    sequence,
    sequenceIndex,
    planStartIndex,
    onUpdateSequence,
    isStudent = false,
    isCollaborationActive = false,
}: SequenceProps) => {
    const { t } = useTranslation();
    const [deletePlanIndex, setDeletePlanIndex] = React.useState(-1);
    const [showDeleteTitle, setShowDeleteTitle] = React.useState(false);
    const createPlanMutation = useCreatePlanMutation();
    const deletePlanMutation = useDeletePlanMutation();
    const updateQuestionMutation = useUpdateQuestionMutation();

    const plans = React.useMemo(() => sequence.plans || [], [sequence]);
    const [showFeedback, setShowFeedback] = React.useState(false);
    const showButtonFeedback = isStudent && sequence.feedback && QuestionStatus.ONGOING === sequence.status;
    const studentColor = COLORS[sequenceIndex];

    const onAddPlan = async () => {
        const newPlans = [...plans];
        let newPlan: Plan;
        if (isSavedProject) {
            try {
                newPlan = await createPlanMutation.mutateAsync({
                    questionId: sequence.id,
                    description: '',
                    index: plans.length,
                    duration: 3000, // 3 seconds
                });
            } catch (err) {
                console.error(err);
                sendToast({ message: t('unknown_error'), type: 'error' });
                return;
            }
        } else {
            newPlan = {
                id: 0,
                description: '',
                index: plans.length,
                imageUrl: null,
                questionId: sequence.id,
                duration: 3000, // 3 seconds
            };
        }
        newPlans.push(newPlan);
        onUpdateSequence({ plans: newPlans });
    };

    const onDeletePlan = async () => {
        const newPlans = [...plans];
        const [planToDelete] = newPlans.splice(deletePlanIndex, 1);
        if (isSavedProject && planToDelete) {
            try {
                await deletePlanMutation.mutateAsync({ planId: planToDelete.id });
            } catch (err) {
                console.error(err);
                sendToast({ message: t('unknown_error'), type: 'error' });
                return;
            }
        }
        setDeletePlanIndex(-1);
        onUpdateSequence({ plans: newPlans });
    };

    const onDeleteTitle = async () => {
        if (isSavedProject) {
            try {
                await updateQuestionMutation.mutateAsync({
                    questionId: sequence.id,
                    title: null,
                });
            } catch (err) {
                console.error(err);
                sendToast({ message: t('unknown_error'), type: 'error' });
                return;
            }
        }
        setShowDeleteTitle(false);
        onUpdateSequence({ title: null });
    };

    return (
        <>
            <Title color="primary" variant="h2" marginTop="lg" style={{ display: 'flex', alignItems: 'center' }}>
                {sequenceIndex + 1}. {sequence.question}
                {isCollaborationActive && studentColor && (
                    <GroupColorPill color={studentColor} status={isStudent ? '' : t(`sequency_status_${sequence.status}`)} />
                )}
                {showButtonFeedback && <ButtonShowFeedback onClick={() => setShowFeedback(true)} />}
            </Title>
            <div className="plans">
                <TitleCard
                    projectId={projectId}
                    questionIndex={sequenceIndex}
                    title={sequence.title}
                    onDelete={() => {
                        setShowDeleteTitle(true);
                    }}
                    canEdit={sequence.status === QuestionStatus.ONGOING || !isStudent}
                />
                {plans.map((plan, planIndex) => (
                    <PlanCard
                        projectId={projectId}
                        key={`${sequenceIndex}_${planIndex}`}
                        plan={plan}
                        questionIndex={sequenceIndex}
                        planIndex={planIndex}
                        showNumber={planStartIndex + planIndex}
                        canDelete={true}
                        onDelete={() => setDeletePlanIndex(planIndex)}
                        canEdit={sequence.status === QuestionStatus.ONGOING || !isStudent}
                    />
                ))}
                {(sequence.status === QuestionStatus.ONGOING || !isStudent) && plans.length < 5 && (
                    <div className="plan-button-container add">
                        {createPlanMutation.isLoading ? (
                            <CircularProgress color="primary" />
                        ) : (
                            <Tooltip position="bottom" content={t('part3_add_plan')} hasArrow>
                                <IconButton
                                    color="primary"
                                    variant="contained"
                                    aria-label={t('part3_add_plan')}
                                    onClick={onAddPlan}
                                    icon={PlusIcon}
                                ></IconButton>
                            </Tooltip>
                        )}
                    </div>
                )}
                <Modal
                    isOpen={deletePlanIndex !== -1}
                    onClose={() => {
                        setDeletePlanIndex(-1);
                    }}
                    onConfirm={onDeletePlan}
                    title={t('part3_delete_plan_question')}
                    confirmLabel={t('delete')}
                    confirmLevel="error"
                    isLoading={deletePlanMutation.isLoading}
                >
                    {t('part3_delete_plan_desc', { planNumber: planStartIndex + deletePlanIndex })}
                </Modal>
                <Modal
                    isOpen={showDeleteTitle}
                    onClose={() => {
                        setShowDeleteTitle(false);
                    }}
                    onConfirm={onDeleteTitle}
                    title={t('part3_delete_plan_title')}
                    confirmLabel={t('delete')}
                    confirmLevel="error"
                    isLoading={updateQuestionMutation.isLoading}
                >
                    {t('part3_delete_plan_title_desc')}
                </Modal>
                <FeedbackModal
                    isOpen={showFeedback}
                    onClose={() => setShowFeedback(false)}
                    feedback={sequence && sequence.feedback ? sequence.feedback : ''}
                />
            </div>
            {isCollaborationActive && !isStudent && sequence.status === QuestionStatus.STORYBOARD && (
                <FormFeedback question={sequence} previousStatus={QuestionStatus.ONGOING} nextStatus={QuestionStatus.PREMOUNTING} />
            )}
        </>
    );
};

const StoryboardPage = () => {
    const router = useRouter();
    const { t, currentLocale } = useTranslation();
    const { project, questions, isLoading: isProjectLoading, updateProject } = useCurrentProject();
    const { theme, isLoading: isThemeLoading } = useTheme(project ? project.themeId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });
    const { scenario } = useScenario(project ? project.scenarioId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });
    const [isLoading, setIsLoading] = React.useState(false);
    const { socket, connectStudent, connectTeacher, updateProject: updateProjectSocket } = useSocket();
    const { isCollaborationActive } = useCollaboration();
    const { user } = React.useContext(userContext);
    const [studentQuestion, setStudentQuestion] = React.useState<Question | null>(null);
    const isStudent = user?.type === UserType.STUDENT;
    const sequencyId = isStudent ? getFromLocalStorage('student', undefined)?.sequencyId || null : null;

    React.useEffect(() => {
        if (isCollaborationActive && socket.connected === false && project !== undefined && project.id) {
            if (isStudent && sequencyId) {
                connectStudent(project.id, sequencyId);
            } else if (!isStudent) {
                connectTeacher(project);
            }
        }
    }, [isCollaborationActive, socket, project, isStudent, sequencyId]);

    React.useEffect(() => {
        const question: Question | undefined = questions.find((q: Question) => q.id === sequencyId);
        if (question) {
            setStudentQuestion(question);
        }
    }, [questions, sequencyId]);

    const startIndexPerQuestion = React.useMemo(() => {
        const newStartIndexPerQuestion: Partial<Record<number, number>> = {};
        questions.reduce<number>((acc, question, index) => {
            newStartIndexPerQuestion[index] = acc;
            return acc + Math.max((question.plans || []).length, 1);
        }, 1);
        return newStartIndexPerQuestion;
    }, [questions]);

    const getData = (): GetPDFParams | undefined => {
        if (!project) {
            return;
        }
        return {
            projectId: project.id,
            projectTitle: project.title,
            themeId: project.themeId,
            themeName: theme?.names?.[currentLocale] || theme?.names?.fr || '',
            scenarioId: project.scenarioId,
            scenarioName: scenario ? scenario.names[currentLocale] || scenario.names[Object.keys(scenario.names)[0]] || '' : '',
            scenarioDescription: scenario
                ? scenario.descriptions[currentLocale] || scenario.descriptions[Object.keys(scenario.descriptions)[0]] || ''
                : '',
            questions,
            languageCode: currentLocale,
        };
    };

    const generatePDF = async () => {
        const data = getData();
        if (!data) {
            return;
        }
        setIsLoading(true);
        const url = await getProjectPdf(data);
        setIsLoading(false);
        if (url) {
            window.open(`/static/pdf/${url}`);
        }
    };

    return (
        <Container>
            {!isStudent ? <ThemeBreadcrumbs theme={theme} isLoading={isThemeLoading}></ThemeBreadcrumbs> : <div style={{ marginTop: '10px' }}></div>}
            <Steps
                activeStep={2}
                themeId={project ? project.themeId : undefined}
                scenarioName={scenario?.names?.[currentLocale] || undefined}
            ></Steps>
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '2rem' }}>
                <Title color="primary" variant="h1" marginY="md">
                    <Inverted isRound>3</Inverted>{' '}
                    <Trans i18nKey="part3_title">
                        Création du <Inverted>Storyboard</Inverted>
                    </Trans>
                </Title>
                <Title color="inherit" variant="h2">
                    {t('part3_desc')}
                </Title>
                {questions.map(
                    (question, index) =>
                        (!isStudent || sequencyId === question.id) && (
                            <Scenario
                                projectId={project?.id || null}
                                isSavedProject={project && project.id !== 0}
                                key={question.id}
                                sequence={question}
                                sequenceIndex={index}
                                planStartIndex={startIndexPerQuestion[index] || 0}
                                onUpdateSequence={(updatedSequence) => {
                                    const newQuestions = [...questions];
                                    newQuestions[index] = {
                                        ...questions[index],
                                        ...updatedSequence,
                                    };
                                    const updatedProject = updateProject({ questions: newQuestions });
                                    if (isCollaborationActive && updatedProject) {
                                        updateProjectSocket(updatedProject);
                                    }
                                }}
                                isStudent={isStudent}
                                isCollaborationActive={isCollaborationActive}
                            />
                        ),
                )}
                {!isStudent && (
                    <div style={{ margin: '32px 0' }}>
                        <Button
                            className={styles.nextButton__next}
                            label={t('part6_pdf_button')}
                            leftIcon={<PictureAsPdf style={{ marginRight: '10px' }} />}
                            variant="outlined"
                            color="secondary"
                            onClick={generatePDF}
                            marginRight="md"
                        ></Button>
                    </div>
                )}
                {isStudent && studentQuestion && studentQuestion.status === QuestionStatus.ONGOING && sequencyId && (
                    <NextStepButton sequencyId={sequencyId} newStatus={QuestionStatus.STORYBOARD} />
                )}
                <NextButton
                    onNext={() => {
                        router.push(`/create/4-pre-mounting${serializeToQueryUrl({ projectId: project?.id || null })}`);
                    }}
                />
            </div>
            <Loader isLoading={isLoading} />
        </Container>
    );
};

export default StoryboardPage;
