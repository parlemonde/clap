import { TrashIcon, LightningBoltIcon } from '@radix-ui/react-icons';
import classNames from 'clsx';
import Link from 'next/link';
import * as React from 'react';

import styles from './plan-card.module.scss';
import { IconButton } from 'src/components/layout/Button/IconButton';
import { useTranslation } from 'src/contexts/translationContext';
import type { Plan } from 'src/hooks/useLocalStorage/local-storage';
import { serializeToQueryUrl } from 'src/utils/serialize-to-query-url';

type PlanCardProps = {
    plan: Plan;
    questionIndex: number;
    planIndex: number;
    showNumber: number;
    canDelete?: boolean;
    onDelete?(): void;
    canEdit?: boolean;
};
export const PlanCard = ({ plan, questionIndex, planIndex, showNumber, canDelete = false, onDelete = () => {}, canEdit = true }: PlanCardProps) => {
    const { t } = useTranslation();
    const buttonStyle: React.CSSProperties = { width: '100%', height: '100%', pointerEvents: canEdit ? 'auto' : 'none' };
    if (plan.imageUrl) {
        buttonStyle.backgroundImage = `url('${plan.imageUrl}')`;
        buttonStyle.backgroundPosition = 'center'; /* Center the image */
        buttonStyle.backgroundRepeat = 'no-repeat'; /* Do not repeat the image */
        buttonStyle.backgroundSize = 'contain';
        buttonStyle.borderRadius = '5px';
    }

    return (
        <Link
            href={`/create/3-storyboard/edit${serializeToQueryUrl({
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
