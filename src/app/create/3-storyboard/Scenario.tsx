import { PlusIcon } from '@radix-ui/react-icons';
import React from 'react';

import { PlanCard } from 'src/components/create/PlanCard';
import { TitleCard } from 'src/components/create/TitleCard';
import { IconButton } from 'src/components/layout/Button/IconButton';
import { CircularProgress } from 'src/components/layout/CircularProgress';
import { Modal } from 'src/components/layout/Modal';
import { Tooltip } from 'src/components/layout/Tooltip';
import { Title } from 'src/components/layout/Typography';
import { useTranslation } from 'src/contexts/translationContext';
import type { Plan, Sequence } from 'src/hooks/useLocalStorage/local-storage';

interface Scenario {
    sequence: Sequence;
    sequenceIndex: number;
    planStartIndex: number;
    onUpdateSequence?: (newSequence: Sequence) => void;
}

export const Scenario = ({ sequence, sequenceIndex, planStartIndex, onUpdateSequence }: Scenario) => {
    const { t } = useTranslation();
    const [showDeleteTitle, setShowDeleteTitle] = React.useState(false);
    const [deletePlanIndex, setDeletePlanIndex] = React.useState(-1);
    const isCreatingPlan = false; // TODO

    const [draggedPlanIndex, setDraggedPlanIndex] = React.useState<number | null>(null);
    const isDragging = draggedPlanIndex !== null;
    const [initialPlans, setInitialPlans] = React.useState<Plan[] | null>(null);
    const onPlanEnter = (planIndex: number) => {
        if (draggedPlanIndex === null || !initialPlans) {
            return;
        }
        const newPlans = [...initialPlans];
        if (draggedPlanIndex < planIndex) {
            newPlans.splice(planIndex + 1, 0, initialPlans[draggedPlanIndex]);
            newPlans.splice(draggedPlanIndex, 1);
        } else {
            newPlans.splice(planIndex, 0, initialPlans[draggedPlanIndex]);
            newPlans.splice(draggedPlanIndex + 1, 1);
        }
        onUpdateSequence?.({ ...sequence, plans: newPlans });
    };

    return (
        <div>
            <Title color="primary" variant="h2" marginTop="lg" style={{ display: 'flex', alignItems: 'center' }}>
                {sequenceIndex + 1}. {sequence.question}
            </Title>
            <div className="plans">
                <TitleCard
                    questionIndex={sequenceIndex}
                    title={sequence.title}
                    onDelete={() => {
                        setShowDeleteTitle(true);
                    }}
                    isDisabled={isDragging}
                />
                {sequence.plans.map((plan, planIndex) => (
                    <PlanCard
                        key={`${sequence.id}-${plan.id}`}
                        plan={plan}
                        questionIndex={sequenceIndex}
                        planIndex={planIndex}
                        showNumber={planStartIndex + (initialPlans?.findIndex((p) => p.id === plan.id) ?? planIndex)}
                        canDelete
                        onDelete={() => {
                            setDeletePlanIndex(planIndex);
                        }}
                        onEnter={() => {
                            onPlanEnter(planIndex);
                        }}
                        isDragging={isDragging}
                        setIsDragging={(isDragging) => {
                            if (isDragging) {
                                setDraggedPlanIndex(planIndex);
                                setInitialPlans([...sequence.plans]);
                            } else {
                                setDraggedPlanIndex(null);
                                setInitialPlans(null);
                            }
                        }}
                        canEdit
                    />
                ))}
                {sequence.plans.length < 5 && !isDragging && (
                    <div className="plan-button-container add">
                        {isCreatingPlan ? (
                            <CircularProgress color="primary" />
                        ) : (
                            <Tooltip position="bottom" content={t('part3_add_plan')} hasArrow>
                                <IconButton
                                    color="primary"
                                    variant="contained"
                                    aria-label={t('part3_add_plan')}
                                    onClick={() => {
                                        const plans = sequence.plans;
                                        const ids = plans.map((plan) => plan.id);
                                        const newId = Math.max(0, ...ids) + 1;
                                        const newSequence = {
                                            ...sequence,
                                            plans: [
                                                ...sequence.plans,
                                                {
                                                    id: newId,
                                                    description: '',
                                                    imageUrl: '',
                                                    duration: 1000,
                                                },
                                            ],
                                        };
                                        onUpdateSequence?.(newSequence);
                                    }}
                                    icon={PlusIcon}
                                ></IconButton>
                            </Tooltip>
                        )}
                    </div>
                )}
            </div>
            <Modal
                isOpen={deletePlanIndex !== -1}
                onClose={() => {
                    setDeletePlanIndex(-1);
                }}
                onConfirm={() => {
                    const newSequence = {
                        ...sequence,
                        plans: sequence.plans.filter((_, index) => index !== deletePlanIndex),
                    };
                    onUpdateSequence?.(newSequence);
                    setDeletePlanIndex(-1);
                }}
                title={t('part3_delete_plan_question')}
                confirmLabel={t('delete')}
                confirmLevel="error"
                isLoading={false} // TODO
            >
                {t('part3_delete_plan_desc', { planNumber: planStartIndex + deletePlanIndex })}
            </Modal>
            <Modal
                isOpen={showDeleteTitle}
                onClose={() => {
                    setShowDeleteTitle(false);
                }}
                onConfirm={() => {
                    const newSequence = { ...sequence, title: undefined };
                    onUpdateSequence?.(newSequence);
                    setShowDeleteTitle(false);
                }}
                title={t('part3_delete_plan_title')}
                confirmLabel={t('delete')}
                confirmLevel="error"
                isLoading={false} // TODO
            >
                {t('part3_delete_plan_title_desc')}
            </Modal>
        </div>
    );
};
