import { useRouter } from 'next/router';
import React from 'react';

import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { PlanCard } from './PlanCard';
import { TitleCard } from './TitleCard';
import { useTranslation } from 'src/i18n/useTranslation';
import type { Question } from 'types/models/question.type';

interface SceneProps {
    q: Question;
    index: number;
    addPlan?(event: React.MouseEvent): void;
    removePlan?(planIndex: number): (event: React.MouseEvent) => void;
    addTitle?(event: React.MouseEvent): void;
    removeTitle?(titleIndex: number): (event: React.MouseEvent) => void;
}

export const Scene: React.FunctionComponent<SceneProps> = ({
    q,
    index,
    addPlan = () => {},
    removePlan = () => () => {},
    addTitle = () => {},
    removeTitle = () => () => {},
}: SceneProps) => {
    const router = useRouter();
    const { t } = useTranslation();

    const handleClick = (planIndex: number) => (event: React.MouseEvent) => {
        event.preventDefault();
        router.push(`/create/3-storyboard-and-filming-schedule/edit?question=${index}&plan=${planIndex}`);
    };

    const plans = q.plans || [];

    return (
        <div style={{ width: '100%', marginTop: '2rem' }}>
            <Typography color="primary" variant="h2">
                {index + 1}. {q.question}
            </Typography>
            <div className="plans">
                <TitleCard questionIndex={index} handleDelete={removeTitle(0)} addTitle={addTitle} />
                {plans.map((plan, planIndex) => (
                    <PlanCard
                        key={`${index}_${planIndex}`}
                        plan={plan}
                        questionIndex={index}
                        planIndex={planIndex}
                        showNumber={(q.planStartIndex ?? 0) + planIndex}
                        canDelete={plans.length > 1}
                        handleClick={handleClick(planIndex)}
                        handleDelete={removePlan(planIndex)}
                    />
                ))}
                {plans.length >= 5 ? null : (
                    <div className="plan-button-container add">
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
                                onClick={addPlan}
                            >
                                <AddIcon />
                            </IconButton>
                        </Tooltip>
                    </div>
                )}
            </div>
        </div>
    );
};
