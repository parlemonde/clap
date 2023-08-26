import { PlusIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/router';
import React from 'react';

import { useDeletePlanMutation } from 'src/api/plans/plans.delete';
import { useCreatePlanMutation } from 'src/api/plans/plans.post';
import { useUpdateQuestionMutation } from 'src/api/questions/questions.put';
import { useScenario } from 'src/api/scenarios/scenarios.get';
import { useTheme } from 'src/api/themes/themes.get';
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
import { sendToast } from 'src/components/ui/Toasts';
import { Trans } from 'src/components/ui/Trans';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { useTranslation } from 'src/i18n/useTranslation';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';
import type { Plan } from 'types/models/plan.type';
import type { Question } from 'types/models/question.type';

type SequenceProps = {
    projectId: number | null;
    isSavedProject?: boolean;
    sequence: Question;
    sequenceIndex: number;
    planStartIndex: number;
    onUpdateSequence(newSequence: Partial<Question>): void;
};
const Scenario = ({ projectId, isSavedProject, sequence, sequenceIndex, planStartIndex, onUpdateSequence }: SequenceProps) => {
    const { t } = useTranslation();
    const [deletePlanIndex, setDeletePlanIndex] = React.useState(-1);
    const [showDeleteTitle, setShowDeleteTitle] = React.useState(false);
    const createPlanMutation = useCreatePlanMutation();
    const deletePlanMutation = useDeletePlanMutation();
    const updateQuestionMutation = useUpdateQuestionMutation();

    const plans = React.useMemo(() => sequence.plans || [], [sequence]);

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
            <Title color="primary" variant="h2" marginTop="lg">
                {sequenceIndex + 1}. {sequence.question}
            </Title>
            <div className="plans">
                <TitleCard
                    projectId={projectId}
                    questionIndex={sequenceIndex}
                    title={sequence.title}
                    onDelete={() => {
                        setShowDeleteTitle(true);
                    }}
                />
                {plans.map((plan, planIndex) => (
                    <PlanCard
                        projectId={projectId}
                        key={`${sequenceIndex}_${planIndex}`}
                        plan={plan}
                        questionIndex={sequenceIndex}
                        planIndex={planIndex}
                        showNumber={planStartIndex + planIndex}
                        canDelete={plans.length > 1}
                        onDelete={() => setDeletePlanIndex(planIndex)}
                    />
                ))}
                {plans.length < 5 && (
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
            </div>
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

    const startIndexPerQuestion = React.useMemo(() => {
        const newStartIndexPerQuestion: Partial<Record<number, number>> = {};
        questions.reduce<number>((acc, question, index) => {
            newStartIndexPerQuestion[index] = acc;
            return acc + Math.max((question.plans || []).length, 1);
        }, 1);
        return newStartIndexPerQuestion;
    }, [questions]);

    return (
        <Container>
            <ThemeBreadcrumbs theme={theme} isLoading={isThemeLoading}></ThemeBreadcrumbs>
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
                {questions.map((question, index) => (
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
                            updateProject({ questions: newQuestions });
                        }}
                    />
                ))}
                <NextButton
                    onNext={() => {
                        router.push(`/create/4-pre-mounting${serializeToQueryUrl({ projectId: project?.id || null })}`);
                    }}
                />
            </div>
        </Container>
    );
};

export default StoryboardPage;
