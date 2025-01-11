import { TrashIcon, LightningBoltIcon } from '@radix-ui/react-icons';
import classNames from 'clsx';
import Link from 'next/link';
import * as React from 'react';
import { createPortal } from 'react-dom';

import styles from './plan-card.module.scss';
import { IconButton } from 'src/components/layout/Button/IconButton';
import { useTranslation } from 'src/contexts/translationContext';
import type { Plan } from 'src/lib/project.types';
import { serializeToQueryUrl } from 'src/lib/serialize-to-query-url';

type PlanCardProps = {
    plan: Plan;
    questionIndex: number;
    planIndex: number;
    showNumber: number;
    canDelete?: boolean;
    onDelete?(): void;
    canEdit?: boolean;
    isDragging?: boolean;
    onEnter?: () => void;
    setIsDragging?: (isDragging: boolean) => void;
};
export const PlanCard = ({
    plan,
    questionIndex,
    planIndex,
    showNumber,
    canDelete = false,
    isDragging,
    onEnter,
    setIsDragging,
    onDelete = () => {},
    canEdit = true,
}: PlanCardProps) => {
    const { t } = useTranslation();
    const buttonStyle: React.CSSProperties = { width: '100%', height: '100%', pointerEvents: canEdit ? 'auto' : 'none' };
    if (plan.imageUrl) {
        buttonStyle.backgroundImage = `url('${plan.imageUrl}')`;
        buttonStyle.backgroundPosition = 'center'; /* Center the image */
        buttonStyle.backgroundRepeat = 'no-repeat'; /* Do not repeat the image */
        buttonStyle.backgroundSize = 'contain';
        buttonStyle.borderRadius = '5px';
    }

    const linkRef = React.useRef<HTMLAnchorElement | null>(null);
    const [draggedStyle, setDraggedStyle] = React.useState<React.CSSProperties | null>(null);

    if (draggedStyle) {
        buttonStyle.opacity = 0.2;
    }

    return (
        <>
            <Link
                href={`/create/3-storyboard/edit${serializeToQueryUrl({
                    question: questionIndex,
                    plan: planIndex,
                })}`}
                ref={linkRef}
                className={styles.planCard}
                style={buttonStyle}
                onMouseEnter={() => {
                    if (!draggedStyle) {
                        onEnter?.();
                    }
                }}
                onMouseDown={(event) => {
                    if (!linkRef.current) {
                        return;
                    }
                    event.preventDefault();
                    const boundingClientRect = linkRef.current.getBoundingClientRect();
                    const baseStyle: React.CSSProperties = {
                        cursor: 'grabbing',
                        position: 'fixed',
                        width: boundingClientRect.width - 2,
                        height: boundingClientRect.height - 2,
                        border: '1px solid #737373',
                        borderRadius: '5px',
                        pointerEvents: 'none',
                    };
                    if (plan.imageUrl) {
                        baseStyle.backgroundImage = `url('${plan.imageUrl}')`;
                        baseStyle.backgroundPosition = 'center'; /* Center the image */
                        baseStyle.backgroundRepeat = 'no-repeat'; /* Do not repeat the image */
                        baseStyle.backgroundSize = 'contain';
                        baseStyle.borderRadius = '5px';
                    }
                    const initialTop = boundingClientRect.top;
                    const initialLeft = boundingClientRect.left;
                    let top = initialTop;
                    let left = initialLeft;
                    const onMouseMove = (moveEvent: MouseEvent) => {
                        top += moveEvent.movementY;
                        left += moveEvent.movementX;
                        if (draggedStyle || Math.sqrt((top - initialTop) ** 2 + (left - initialLeft) ** 2) > 5) {
                            setDraggedStyle({ ...baseStyle, top, left });
                            setIsDragging?.(true);
                        }
                    };
                    const onMouseUp = () => {
                        setTimeout(() => {
                            setDraggedStyle(null);
                            setIsDragging?.(false);
                        }, 10);
                        window.removeEventListener('mousemove', onMouseMove);
                    };
                    window.addEventListener('mousemove', onMouseMove);
                    window.addEventListener('mouseup', onMouseUp, {
                        once: true,
                    });
                }}
                onClick={(event) => {
                    if (draggedStyle) {
                        event.preventDefault();
                    }
                }}
            >
                <div className={classNames('pill', styles.planCard__number, { ['pill--purple']: Boolean(plan.imageUrl) })}>{showNumber}</div>
                <div className={classNames('pill', styles.planCard__bolt, { ['pill--green']: Boolean(plan.description) })}>
                    <LightningBoltIcon />
                </div>
                {!isDragging && <div className={styles.planCard__editButton}>{t('edit')}</div>}
                {canDelete && !isDragging && (
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
            {draggedStyle &&
                createPortal(
                    <div style={draggedStyle}>
                        <div className={classNames('pill', styles.planCard__number, { ['pill--purple']: Boolean(plan.imageUrl) })}>{showNumber}</div>
                        <div className={classNames('pill', styles.planCard__bolt, { ['pill--green']: Boolean(plan.description) })}>
                            <LightningBoltIcon />
                        </div>
                    </div>,
                    document.body,
                )}
        </>
    );
};
