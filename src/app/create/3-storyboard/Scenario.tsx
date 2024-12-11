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
import type { Sequence } from 'src/hooks/useLocalStorage/local-storage';

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
                />
                {sequence.plans.map((plan, planIndex) => (
                    <PlanCard
                        key={`${sequence.id}-${plan.id}`}
                        plan={plan}
                        questionIndex={sequenceIndex}
                        planIndex={planIndex}
                        showNumber={planStartIndex + planIndex}
                        canDelete
                        onDelete={() => {
                            setDeletePlanIndex(planIndex);
                        }}
                        canEdit
                    />
                ))}
                {sequence.plans.length < 5 && (
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
