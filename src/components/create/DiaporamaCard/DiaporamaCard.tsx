import { FileTextIcon, SpeakerLoudIcon } from '@radix-ui/react-icons';
import classNames from 'classnames';
import Link from 'next/link';
import React from 'react';

import styles from './diaporama-card.module.scss';
import { useResizeObserver } from 'src/hooks/useResizeObserver';
import { useTranslation } from 'src/i18n/useTranslation';
import { getSequenceDuration } from 'src/lib/get-sequence-duration';
import TimerIcon from 'src/svg/timer.svg';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';
import type { Question } from 'types/models/question.type';

type DiaporamaCardProps = {
    projectId: number | null;
    questionIndex: number;
    sequence: Question;
    isAuthorized?: boolean;
};
export const DiaporamaCard = ({ projectId, questionIndex, sequence, isAuthorized = true }: DiaporamaCardProps) => {
    const { t } = useTranslation();
    const [frameIndex, setFrameIndex] = React.useState<'title' | number>(sequence.title !== null ? 'title' : 0);
    const [canvasRef, { height: canvasHeight }] = useResizeObserver<HTMLAnchorElement>();

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

    const style = React.useMemo(() => {
        if (!sequence.title || sequence.title.style === '') {
            return null;
        }
        try {
            return JSON.parse(sequence.title.style);
        } catch (err) {
            return null;
        }
    }, [sequence]);

    const baseButtonStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        pointerEvents: isAuthorized ? 'auto' : 'none',
        backgroundColor: style?.backgroundColor || 'white',
        color: style?.color || 'black',
    };

    const updateFrameIndex = React.useCallback(() => {
        setFrameIndex((prevFrame) => {
            let nextFrame: 'title' | number = prevFrame === 'title' ? 0 : prevFrame + 1;
            if (nextFrame >= (sequence.plans || []).length) {
                nextFrame = sequence.title !== null ? 'title' : 0;
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
            href={`/create/4-pre-mounting/edit${serializeToQueryUrl({ question: questionIndex, projectId })}`}
            className={styles.DiaporamaCard}
            style={{ ...baseButtonStyle, ...buttonStyle }}
            ref={canvasRef}
        >
            {frameIndex === 'title' && style && sequence.title && (
                <p
                    className={styles.DiaporamaCard__title}
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
                                  backgroundColor: style.backgroundColor || 'white',
                                  textAlign: style.textAlign || 'center',
                                  color: style.color || 'black',
                              }
                    }
                >
                    {sequence.title.text}
                </p>
            )}

            <div className={styles.DiaporamaCard__editButton}>{t('edit')}</div>
            <div className={classNames('pill', styles.DiaporamaCard__voice, { ['pill--green']: Boolean(sequence.voiceOff) })}>
                <FileTextIcon />
            </div>
            <div className={classNames('pill', styles.DiaporamaCard__sound, { ['pill--green']: Boolean(sequence.soundUrl) })}>
                <SpeakerLoudIcon />
            </div>
            <div className={classNames('pill', 'pill--purple', styles.DiaporamaCard__time)}>
                <TimerIcon style={{ height: '95%' }} />
                <span className={styles.DiaporamaCard__seconds}>{Math.round(duration / 1000)}s</span>
            </div>
        </Link>
    );
};
