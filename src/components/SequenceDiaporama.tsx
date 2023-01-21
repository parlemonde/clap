import Link from 'next/link';
import React from 'react';

import ChatIcon from '@mui/icons-material/Chat';
import TimerIcon from '@mui/icons-material/Timer';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ButtonBase from '@mui/material/ButtonBase';

import { useResizeObserver } from 'src/hooks/useResizeObserver';
import { useTranslation } from 'src/i18n/useTranslation';
import { getSequenceDuration } from 'src/lib/get-sequence-duration';
import type { Question } from 'types/models/question.type';

type SequenceDiaporamaProps = {
    questionIndex: number;
    sequence: Question;
};
export const SequenceDiaporama = ({ questionIndex, sequence }: SequenceDiaporamaProps) => {
    const { t } = useTranslation();
    const [frameIndex, setFrameIndex] = React.useState<'title' | number>(sequence.title !== null ? 'title' : 0);
    const intervalRef = React.useRef<number | null>(null);
    const [canvasRef, { height: canvasHeight }] = useResizeObserver<HTMLDivElement>();

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
        if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
        }
        intervalRef.current = window.setInterval(updateFrameIndex, 4000);
        return () => {
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
            }
        };
    }, [updateFrameIndex]);

    return (
        <Link href={`/create/4-pre-mounting/edit?question=${questionIndex}`} passHref>
            <ButtonBase component="a" style={{ width: '100%', height: '100%', ...buttonStyle }}>
                <div className="plan" ref={canvasRef}>
                    <div className="edit">{t('edit')}</div>
                    {frameIndex === 'title' && style && sequence.title && (
                        <p
                            className="title-card-text"
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
                            {sequence.title.text}
                        </p>
                    )}
                    <div className="diaporama-indicators">
                        <div style={{ display: 'inline-flex' }}>
                            <div className={`bolt ${sequence.voiceOff ? 'green' : ''}`} style={{ marginRight: '0.25rem' }}>
                                <ChatIcon sx={{ fontSize: '1.25rem', margin: '2px 0' }} />
                            </div>
                            <div className={`bolt ${sequence.soundUrl ? 'green' : ''}`}>
                                <VolumeUpIcon sx={{ fontSize: '1.25rem', margin: '2px 0' }} />
                            </div>
                        </div>
                        <div className="time">
                            <TimerIcon sx={{ fontSize: '1.25rem', margin: '2px 0' }} />
                            {Math.round(duration / 1000)}s
                        </div>
                    </div>
                </div>
            </ButtonBase>
        </Link>
    );
};
