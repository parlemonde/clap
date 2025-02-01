'use client';

import { Pencil1Icon } from '@radix-ui/react-icons';
import clsx from 'clsx';
import * as React from 'react';

import styles from './project-card.module.scss';
import { IconButton } from 'src/components/layout/Button/IconButton';
import { Title } from 'src/components/layout/Typography';
import { useTranslation } from 'src/contexts/translationContext';

type ProjectCardProps = {
    title?: string;
    themeName?: string;
    onClick?: (event: React.MouseEvent) => void;
    onClickEdit?(event: React.MouseEvent): void;
    className?: string;
};
export const ProjectCard = ({ title = '', themeName = '', onClick, onClickEdit, className }: ProjectCardProps) => {
    const { t } = useTranslation();

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
                    <label>{t('my_videos_themes')}</label> {themeName}
                </div>
            )}
            {onClickEdit !== undefined && (
                <div className={styles.ProjectCard__EditButton}>
                    <IconButton
                        color="primary"
                        aria-label={t('delete')}
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
