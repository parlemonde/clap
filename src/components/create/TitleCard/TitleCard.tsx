import { TrashIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import * as React from 'react';

import styles from './title-card.module.scss';
import { IconButton } from 'src/components/layout/Button/IconButton';
import { useResizeObserver } from 'src/hooks/useResizeObserver';
import { useTranslation } from 'src/i18n/useTranslation';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';
import type { Title } from 'types/models/title.type';

type TitleCardProps = {
    projectId: number | null;
    questionIndex: number;
    title?: Title | null;
    onDelete?(): void;
};

export const TitleCard = ({ projectId, questionIndex, title, onDelete = () => {} }: TitleCardProps) => {
    const { t } = useTranslation();
    const style = React.useMemo(() => {
        if (!title || title.style === '') {
            return null;
        }
        try {
            return JSON.parse(title.style);
        } catch (err) {
            return null;
        }
    }, [title]);
    const [canvasRef, { height: canvasHeight }] = useResizeObserver<HTMLAnchorElement>();

    return (
        <Link href={`/create/3-storyboard/title${serializeToQueryUrl({ question: questionIndex, projectId })}`} passHref>
            <a className={styles.titleCard} ref={canvasRef}>
                {title ? (
                    <p
                        className={styles.titleCard__title}
                        style={
                            style === null
                                ? {}
                                : {
                                      fontSize: `${((style.fontSize || 8) * canvasHeight) / 100}px`,
                                      lineHeight: `${((style.fontSize || 8) * canvasHeight) / 100}px`,
                                      fontFamily: style.fontFamily || 'serif',
                                      left: `${style.x ?? 15}%`,
                                      top: `${style.y ?? 30}%`,
                                      width: `${style.width ?? 70}%`,
                                  }
                        }
                    >
                        {title.text}
                    </p>
                ) : (
                    <>
                        <span className={styles.titleCard__placeholder}>T</span>
                        <span className={styles.titleCard__placeholderDesc}>{t('part3_add_title')}</span>
                    </>
                )}
                {title && (
                    <>
                        <div className={styles.titleCard__editButton}>{t('edit')}</div>
                        <IconButton
                            className={styles.titleCard__deleteButton}
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
                    </>
                )}
            </a>
        </Link>
    );
};
