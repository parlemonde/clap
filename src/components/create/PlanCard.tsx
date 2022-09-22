import React from 'react';

import BoltIcon from '@mui/icons-material/Bolt';
import DeleteIcon from '@mui/icons-material/Delete';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';

import { useTranslation } from 'src/i18n/useTranslation';
import type { Plan } from 'types/models/plan.type';

interface PlanCardProps {
    plan: Plan;
    questionIndex: number;
    planIndex: number;
    showNumber: number;
    canDelete?: boolean;
    handleClick?(event: React.MouseEvent): void;
    handleDelete?(event: React.MouseEvent): void;
}

export const PlanCard: React.FunctionComponent<PlanCardProps> = ({
    plan,
    questionIndex,
    planIndex,
    showNumber,
    canDelete = false,
    handleClick = () => {},
    handleDelete = () => {},
}: PlanCardProps) => {
    const { t } = useTranslation();
    const buttonStyle: React.CSSProperties = { width: '100%', height: '100%' };
    if (plan.url) {
        buttonStyle.backgroundImage = `url('${plan.url}')`;
        buttonStyle.backgroundPosition = 'center'; /* Center the image */
        buttonStyle.backgroundRepeat = 'no-repeat'; /* Do not repeat the image */
        buttonStyle.backgroundSize = 'cover';
    }

    return (
        <div className="plan-button-container" key={planIndex}>
            <ButtonBase
                component="a"
                href={`/create/3-storyboard-and-filming-schedule/edit?question=${questionIndex}&plan=${planIndex}`}
                onClick={handleClick}
                style={buttonStyle}
            >
                <div className="plan">
                    <div className={`number ${plan.url ? 'purple' : ''}`}>{showNumber}</div>
                    <div className={`bolt ${plan.description ? 'green' : ''}`}>
                        <BoltIcon />
                    </div>
                    <div className="edit">{t('edit')}</div>
                    {canDelete && (
                        <div className="delete">
                            <IconButton
                                sx={{
                                    backgroundColor: (theme) => theme.palette.error.main,
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: (theme) => theme.palette.error.light,
                                    },
                                }}
                                aria-label={t('delete')}
                                size="small"
                                onClick={handleDelete}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </div>
                    )}
                </div>
            </ButtonBase>
        </div>
    );
};
