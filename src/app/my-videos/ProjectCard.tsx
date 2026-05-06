'use client';

import { Pencil1Icon } from '@radix-ui/react-icons';
import clsx from 'clsx';
import { useExtracted } from 'next-intl';
import * as React from 'react';

import { IconButton } from '@frontend/components/layout/Button/IconButton';
import { Title } from '@frontend/components/layout/Typography';

import styles from './project-card.module.css';

type ProjectCardProps = {
    title?: string;
    themeName?: string;
    onClick?: (event: React.MouseEvent) => void;
    onClickEdit?(event: React.MouseEvent): void;
    className?: string;
};
export const ProjectCard = ({ title = '', themeName = '', onClick, onClickEdit, className }: ProjectCardProps) => {
    const t = useExtracted('my-videos.ProjectCard');
    const commonT = useExtracted('common');

    return (
        <div
            role="button"
            onClick={onClick}
            tabIndex={0}
            onKeyDown={(event) => {
                if ((event.key === 'Enter' || event.key === ' ') && event.target instanceof HTMLElement) {
                    event.target.click();
                }
            }}
            className={clsx(styles.ProjectCard, className)}
        >
            <Title color="primary" variant="h3" className="text-center">
                {title}
            </Title>
            {themeName !== '' && (
                <div className={styles.ProjectCard__ThemeName}>
                    <label>{t('Thème : {themeName}', { themeName })}</label>
                </div>
            )}
            {onClickEdit !== undefined && (
                <div className={styles.ProjectCard__EditButton}>
                    <IconButton
                        color="primary"
                        aria-label={commonT('Modifier')}
                        size="sm"
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            onClickEdit(event);
                        }}
                        icon={Pencil1Icon}
                    ></IconButton>
                </div>
            )}
        </div>
    );
};
