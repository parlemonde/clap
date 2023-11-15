import { Pencil1Icon } from '@radix-ui/react-icons';
import classNames from 'classnames';
import Link from 'next/link';
import * as React from 'react';

import styles from './project-card.module.scss';
import { IconButton } from 'src/components/layout/Button/IconButton';
import { Title } from 'src/components/layout/Typography';
import { useTranslation } from 'src/i18n/useTranslation';

type ProjectCardProps = {
    href: string;
    title?: string;
    themeName?: string;
    onClickEdit?(event: React.MouseEvent): void;
    className?: string;
};
export const ProjectCard = ({ title = '', themeName = '', href, onClickEdit, className }: ProjectCardProps) => {
    const { t } = useTranslation();
    return (
        <Link href={href} className={classNames(styles.ProjectCard, className)}>
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
        </Link>
    );
};
