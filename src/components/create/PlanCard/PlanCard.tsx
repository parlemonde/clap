import { TrashIcon, LightningBoltIcon } from '@radix-ui/react-icons';
import classNames from 'classnames';
import Link from 'next/link';
import * as React from 'react';

import styles from './plan-card.module.scss';
import { IconButton } from 'src/components/layout/Button/IconButton';
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
            className={styles.planCard}
            style={buttonStyle}
        >
            <div className={classNames('pill', styles.planCard__number, { ['pill--purple']: Boolean(plan.imageUrl) })}>{showNumber}</div>
            <div className={classNames('pill', styles.planCard__bolt, { ['pill--green']: Boolean(plan.description) })}>
                <LightningBoltIcon />
            </div>
            <div className={styles.planCard__editButton}>{t('edit')}</div>
            {canDelete && (
                <IconButton
                    className={styles.planCard__deleteButton}
                    aria-label={t('delete')}
                    icon={TrashIcon}
                    color="error"
                    variant="contained"
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onDelete();
                    }}
                />
            )}
        </Link>
    );
};
