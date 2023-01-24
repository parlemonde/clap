import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React from 'react';

import AddIcon from '@mui/icons-material/Add';
import { CircularProgress, IconButton, Tooltip, Typography } from '@mui/material';

import { useDeletePlanMutation } from 'src/api/plans/plans.delete';
import { useCreatePlanMutation } from 'src/api/plans/plans.post';
import { useUpdateQuestionMutation } from 'src/api/questions/questions.put';
import { useScenario } from 'src/api/scenarios/scenarios.get';
import { useTheme } from 'src/api/themes/themes.get';
import { PlanCard } from 'src/components/PlanCard';
import { TitleCard } from 'src/components/TitleCard';
import { NextButton } from 'src/components/navigation/NextButton';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import Modal from 'src/components/ui/Modal';
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
    const { enqueueSnackbar } = useSnackbar();
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
                enqueueSnackbar(t('unknown_error'), {
                    variant: 'error',
                });
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
                enqueueSnackbar(t('unknown_error'), {
                    variant: 'error',
                });
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
                enqueueSnackbar(t('unknown_error'), {
                    variant: 'error',
                });
                return;
            }
        }
        setShowDeleteTitle(false);
        onUpdateSequence({ title: null });
    };

    return (
        <>
            <Typography color="primary" variant="h2" style={{ marginTop: '2rem' }}>
                {sequenceIndex + 1}. {sequence.question}
            </Typography>
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
                            <Tooltip title={t('part3_add_plan')} aria-label={t('part3_add_plan')}>
                                <IconButton
                                    sx={{
                                        backgroundColor: (theme) => theme.palette.primary.main,
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: (theme) => theme.palette.primary.light,
                                        },
                                    }}
                                    color="primary"
                                    aria-label={t('part3_add_plan')}
                                    onClick={onAddPlan}
                                >
                                    <AddIcon />
                                </IconButton>
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
                    ariaLabelledBy="delete_plan_confirm"
                    ariaDescribedBy="delete_plan_confirm_description"
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
                    ariaLabelledBy="delete_title_confirm"
                    ariaDescribedBy="delete_title_confirm_description"
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
        <div>
            <ThemeBreadcrumbs theme={theme} isLoading={isThemeLoading}></ThemeBreadcrumbs>
            <Steps
                activeStep={2}
                themeId={project ? project.themeId : undefined}
                scenarioName={scenario?.names?.[currentLocale] || undefined}
            ></Steps>
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '2rem' }}>
                <Typography color="primary" variant="h1">
                    <Inverted round>3</Inverted>{' '}
                    <Trans i18nKey="part3_title">
                        Création du <Inverted>Storyboard</Inverted>
                    </Trans>
                </Typography>
                <Typography color="inherit" variant="h2">
                    {t('part3_desc')}
                </Typography>
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
        </div>
    );
};

export default StoryboardPage;
