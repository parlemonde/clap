import { FileTextIcon, SpeakerLoudIcon } from '@radix-ui/react-icons';
import classNames from 'clsx';
import React from 'react';

import styles from './diaporama-card.module.scss';
import { Link } from 'src/components/navigation/Link';
import { useTranslation } from 'src/contexts/translationContext';
import type { Sequence } from 'src/database/schemas/projects';
import { getSequenceDuration } from 'src/lib/get-sequence-duration';
import { serializeToQueryUrl } from 'src/lib/serialize-to-query-url';
import TimerIcon from 'src/svg/timer.svg';

type DiaporamaCardProps = {
    questionIndex: number;
    sequence: Sequence;
    isDisabled?: boolean;
};
export const DiaporamaCard = ({ questionIndex, sequence, isDisabled }: DiaporamaCardProps) => {
    const { t } = useTranslation();
    const [frameIndex, setFrameIndex] = React.useState<'title' | number>(sequence.title !== null ? 'title' : 0);
    const [canvasHeight, setCanvasHeight] = React.useState(0); // TODO
    const resizeObserver = React.useMemo<ResizeObserver>(
        () =>
            new ResizeObserver((entries) => {
                if (entries.length === 1) {
                    setCanvasHeight(entries[0].contentRect.height);
                }
            }),
        [],
    );
    const onCanvasRef = React.useCallback(
        (canvas: HTMLAnchorElement | null) => {
            if (canvas) {
                resizeObserver.observe(canvas);
            } else {
                resizeObserver.disconnect();
            }
        },
        [resizeObserver],
    );

    const buttonStyle = React.useMemo(() => {
        const plan = frameIndex !== 'title' ? (sequence.plans || [])[frameIndex] : undefined;
        if (plan && plan.imageUrl) {
            return {
                backgroundImage: `url('${plan.imageUrl}')`,
                backgroundPosition: 'center' /* Center the image */,
                backgroundRepeat: 'no-repeat' /* Do not repeat the image */,
                backgroundSize: 'cover',
                borderRadius: '5px',
            };
        }
        return {};
    }, [sequence, frameIndex]);

    const baseButtonStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        pointerEvents: isDisabled ? 'none' : 'auto',
        backgroundColor: frameIndex === 'title' && sequence.title ? sequence.title.backgroundColor : 'black',
    };

    const updateFrameIndex = React.useCallback(() => {
        setFrameIndex((prevFrame) => {
            let nextFrame: 'title' | number = prevFrame === 'title' ? 0 : prevFrame + 1;
            if (nextFrame >= (sequence.plans || []).length) {
                nextFrame = sequence.title ? 'title' : 0;
            }
            return nextFrame;
        });
    }, [sequence]);

    const duration = getSequenceDuration(sequence);

    React.useEffect(() => {
        const interval = window.setInterval(updateFrameIndex, 4000);
        return () => {
            window.clearInterval(interval);
        };
    }, [updateFrameIndex]);

    return (
        <Link
            href={`/create/4-pre-mounting/edit${serializeToQueryUrl({ question: questionIndex })}`}
            className={styles.DiaporamaCard}
            style={{ ...baseButtonStyle, ...buttonStyle }}
            ref={onCanvasRef}
        >
            {frameIndex === 'title' && sequence.title && (
                <p
                    className={styles.DiaporamaCard__title}
                    style={{
                        fontSize: `${(sequence.title.fontSize * canvasHeight) / 100}px`,
                        lineHeight: 1,
                        fontFamily: sequence.title.fontFamily,
                        fontWeight: 400,
                        left: `${sequence.title.x}%`,
                        top: `${sequence.title.y}%`,
                        width: `${sequence.title.width}%`,
                        textAlign: sequence.title.textAlign,
                        color: sequence.title.color,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                    }}
                >
                    {sequence.title.text}
                </p>
            )}

            <div className={styles.DiaporamaCard__editButton}>{t('edit')}</div>
            <div className={classNames('pill', styles.DiaporamaCard__voice, { ['pill--green']: Boolean(sequence.voiceText) })}>
                {/* Boolean(sequence.voiceOff) */}
                <FileTextIcon />
            </div>
            <div className={classNames('pill', styles.DiaporamaCard__sound, { ['pill--green']: Boolean(sequence.soundUrl) })}>
                {/* Boolean(sequence.soundUrl) */}
                <SpeakerLoudIcon />
            </div>
            <div className={classNames('pill', 'pill--purple', styles.DiaporamaCard__time)}>
                <TimerIcon style={{ height: '95%' }} />
                <span className={styles.DiaporamaCard__seconds}>{Math.round(duration / 1000)}s</span>
            </div>
        </Link>
    );
};
