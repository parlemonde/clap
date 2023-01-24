import Link from 'next/link';
import React from 'react';

import BoltIcon from '@mui/icons-material/Bolt';
import DeleteIcon from '@mui/icons-material/Delete';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';

import { useTranslation } from 'src/i18n/useTranslation';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';
import type { Plan } from 'types/models/plan.type';

type PlanCardProps = {
    projectId: number | null;
    plan: Plan;
    questionIndex: number;
    planIndex: number;
    showNumber: number;
    canDelete?: boolean;
    onDelete?(): void;
};

export const PlanCard = ({ projectId, plan, questionIndex, planIndex, showNumber, canDelete = false, onDelete = () => {} }: PlanCardProps) => {
    const { t } = useTranslation();
    const buttonStyle: React.CSSProperties = { width: '100%', height: '100%' };
    if (plan.imageUrl) {
        buttonStyle.backgroundImage = `url('${plan.imageUrl}')`;
        buttonStyle.backgroundPosition = 'center'; /* Center the image */
        buttonStyle.backgroundRepeat = 'no-repeat'; /* Do not repeat the image */
        buttonStyle.backgroundSize = 'cover';
        buttonStyle.borderRadius = '5px';
    }

    return (
        <Link
            href={`/create/3-storyboard/edit${serializeToQueryUrl({
                projectId,
                question: questionIndex,
                plan: planIndex,
            })}`}
            passHref
        >
            <ButtonBase component="a" style={buttonStyle}>
                <div className="plan">
                    <div className={`plan-number ${plan.imageUrl ? 'purple' : ''}`}>{showNumber}</div>
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
                                onClick={(event) => {
                                    event.stopPropagation();
                                    event.preventDefault();
                                    onDelete();
                                }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </div>
                    )}
                </div>
            </ButtonBase>
        </Link>
    );
};
