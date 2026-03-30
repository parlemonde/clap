import { TrashIcon } from '@radix-ui/react-icons';
import * as React from 'react';
import { serializeToQueryUrl } from 'src/lib/serialize-to-query-url';

import { IconButton } from '@frontend/components/layout/Button/IconButton';
import { Link } from '@frontend/components/navigation/Link';
import { useTranslation } from '@frontend/contexts/translationContext';

import type { Sequence } from '@server/database/schemas/projects';

import styles from './title-card.module.scss';

type TitleCardProps = {
    title?: Sequence['title'];
    questionIndex: number;
    onDelete?: () => void;
    isDisabled?: boolean;
};

export const TitleCard = ({ title, questionIndex, onDelete = () => {}, isDisabled }: TitleCardProps) => {
    const canvasId = `canvas-${React.useId()}`;
    const { t } = useTranslation();

    // Use a ResizeObserver to get the height of the canvas
    // This is used to calculate the font size and position of the title
    const canvasRef = React.useRef<HTMLAnchorElement>(null);
    const [canvasHeight, setCanvasHeight] = React.useState(0);
    const resizeObserver = React.useMemo<ResizeObserver>(
        () =>
            new ResizeObserver((entries) => {
                for (const entry of entries) {
                    if (entry.target.id === canvasId) {
                        setCanvasHeight(entry.contentRect.height);
                    }
                }
            }),
        [canvasId],
    );

    // On mount, observe the canvas
    React.useEffect(() => {
        const el = canvasRef.current;
        if (!el) {
            return () => {};
        }
        resizeObserver.observe(el);
        return () => {
            resizeObserver.unobserve(el);
        };
    }, [resizeObserver]);

    // On unmount, cleanup the resize observer
    React.useEffect(() => {
        return () => {
            resizeObserver.disconnect();
        };
    }, [resizeObserver]);

    return (
        <Link
            href={`/create/3-storyboard/title${serializeToQueryUrl({ question: questionIndex })}`}
            className={styles.titleCard}
            ref={canvasRef}
            id={canvasId}
            style={{
                boxSizing: 'border-box',
                backgroundColor: title ? title.backgroundColor : 'white',
                pointerEvents: isDisabled ? 'none' : 'auto',
            }}
        >
            {title ? (
                <p
                    className={styles.titleCard__title}
                    style={{
                        fontSize: `${(title.fontSize * canvasHeight) / 100}px`,
                        lineHeight: 1,
                        fontFamily: title.fontFamily,
                        fontWeight: 400,
                        left: `${title.x}%`,
                        top: `${title.y}%`,
                        width: `${title.width}%`,
                        textAlign: title.textAlign,
                        color: title.color,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                    }}
                >
                    {title.text}
                </p>
            ) : (
                <>
                    <span className={styles.titleCard__placeholder}>T</span>
                    <span className={styles.titleCard__placeholderDesc}>{t('3_title_storyboard_page.add_title_card.label')}</span>
                </>
            )}
            {title && (
                <>
                    <div className={styles.titleCard__editButton}>{t('common.actions.edit')}</div>
                    <IconButton
                        className={styles.titleCard__deleteButton}
                        aria-label={t('common.actions.delete')}
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
        </Link>
    );
};
