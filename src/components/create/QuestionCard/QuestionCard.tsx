import { DragHandleDots2Icon, Pencil1Icon, TrashIcon, ArrowUpIcon, ArrowDownIcon, GearIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import React from 'react';

import styles from './question-card.module.scss';
import { IconButton } from 'src/components/layout/Button/IconButton';
import { serializeToQueryUrl } from 'src/lib/serialize-to-query-url';

type QuestionCardProps = {
    projectId: number | null;
    question: string;
    index?: number;
    onDelete?(): void;
    onIndexUp?(): void;
    onIndexDown?(): void;
    onEditStatus?(): void;
};

export const QuestionCard = ({ projectId, question, index = 0, onDelete, onIndexUp, onIndexDown, onEditStatus }: QuestionCardProps) => {
    return (
        <div className={styles.questionContainer}>
            <div className={styles.questionIndex}>
                <DragHandleDots2Icon />
                {onIndexUp && (
                    <IconButton
                        variant="borderless"
                        style={{ color: 'white' }}
                        aria-label="move up"
                        size="sm"
                        onClick={onIndexUp}
                        icon={ArrowUpIcon}
                        isVisuallyHidden
                    ></IconButton>
                )}
                {onIndexDown && (
                    <IconButton
                        variant="borderless"
                        style={{ color: 'white' }}
                        aria-label="move down"
                        size="sm"
                        onClick={onIndexDown}
                        icon={ArrowDownIcon}
                        isVisuallyHidden
                    ></IconButton>
                )}
                {index + 1}
            </div>
            <div className={styles.questionContent}>
                <p>{question}</p>
            </div>
            <div className={styles.questionActions}>
                <Link href={`/create/2-questions/edit${serializeToQueryUrl({ question: index, projectId })}`} legacyBehavior passHref>
                    <IconButton as="a" aria-label="edit" size="sm" color="secondary" marginRight="sm" icon={Pencil1Icon}></IconButton>
                </Link>
                {onDelete && <IconButton aria-label="delete" size="sm" color="secondary" onClick={onDelete} icon={TrashIcon}></IconButton>}
                {onEditStatus && (
                    <IconButton aria-label="delete" size="sm" color="secondary" marginLeft="sm" onClick={onEditStatus} icon={GearIcon}></IconButton>
                )}
            </div>
        </div>
    );
};
