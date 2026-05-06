import { TrashIcon } from '@radix-ui/react-icons';
import { useExtracted } from 'next-intl';
import * as React from 'react';

import { IconButton } from '@frontend/components/layout/Button/IconButton';
import { Link } from '@frontend/components/navigation/Link';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import type { Sequence } from '@server/database/schemas/projects';

import styles from './title-card.module.css';

type TitleCardProps = {
    title?: Sequence['title'];
    questionIndex: number;
    onDelete?: () => void;
    isDisabled?: boolean;
};

export const TitleCard = ({ title, questionIndex, onDelete = () => {}, isDisabled }: TitleCardProps) => {
    const canvasId = `canvas-${React.useId()}`;

    const tx = useExtracted('TitleCard');
    const commonT = useExtracted('common');

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
                    <span className={styles.titleCard__placeholderDesc}>{tx('Ajouter un titre')}</span>
                </>
            )}
            {title && (
                <>
                    <div className={styles.titleCard__editButton}>{commonT('Modifier')}</div>
                    <IconButton
                        className={styles.titleCard__deleteButton}
                        aria-label={commonT('Supprimer')}
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
