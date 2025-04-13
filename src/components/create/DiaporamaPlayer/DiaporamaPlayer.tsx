import { MinusIcon, PlusIcon, SpeakerLoudIcon, ImageIcon, SpeakerQuietIcon, PlayIcon, PauseIcon } from '@radix-ui/react-icons';
import Head from 'next/head';
import Image from 'next/legacy/image';
import React from 'react';

import { Frame } from './Frame';
import { WaveForm } from './WaveForm';
import styles from './diaporama-player.module.scss';
import { useAudio } from './useAudio';
import { IconButton } from 'src/components/layout/Button/IconButton';
import { Input } from 'src/components/layout/Form';
import { KeepRatio } from 'src/components/layout/KeepRatio';
import { Slider } from 'src/components/layout/Slider';
import { sendToast } from 'src/components/ui/Toasts';
import type { Sequence } from 'src/database/schemas/projects';
import { getFormatedTime } from 'src/lib/get-formatted-time';
import { getProjectDuration } from 'src/lib/get-project-duration';
import { isSequenceAvailable } from 'src/lib/get-sequence-duration';
import type { Sound } from 'src/lib/get-sounds';
import CodeIcon from 'src/svg/code.svg';

const PLAYER_ID = 'diaporama-player';

type DiaporamaPlayerProps = {
    questions: Sequence[];
    sounds: Sound[];
    volume: number;
    soundUrl: string;
    soundBeginTime: number;
    canEdit?: boolean;
    canEditPlans?: boolean;
    setQuestion?: (newQuestion: Sequence) => void;
    setSoundBeginTime: (newSoundBeginTime: number) => void;
    setVolume: (newVolume: number) => void;
};
export const DiaporamaPlayer = ({
    questions: allQuestions,
    sounds,
    soundUrl,
    soundBeginTime,
    volume,
    canEdit = false,
    canEditPlans = false,
    setQuestion = () => {},
    setSoundBeginTime,
    setVolume,
}: DiaporamaPlayerProps) => {
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [time, setTime] = React.useState<number>(0);
    const { onPlay: onPlayAudio, onStop: onStopAudio, onUpdateVolume, onUpdateCurrentTime } = useAudio(soundUrl, volume, sounds);
    const mountingTableRef = React.useRef<HTMLDivElement>(null);
    const [mountingTableWidth, setMountingTableWidth] = React.useState(0);
    const animationFrameRef = React.useRef<number | null>(null);
    const previousTimeRef = React.useRef<number | null>(null);
    const questions = React.useMemo(() => allQuestions.filter((q) => isSequenceAvailable(q)), [allQuestions]);
    const duration = React.useMemo(() => getProjectDuration(questions), [questions]);

    const resizeObserver = React.useMemo<ResizeObserver>(
        () =>
            new ResizeObserver((entries) => {
                for (const entry of entries) {
                    if (entry.target.id === PLAYER_ID) {
                        setMountingTableWidth(entry.contentRect.width);
                    }
                }
            }),
        [],
    );
    const onMountingTableRef = React.useCallback(
        (elem: HTMLDivElement | null) => {
            if (elem) {
                resizeObserver.observe(elem);
                mountingTableRef.current = elem;
            } else {
                resizeObserver.disconnect();
                mountingTableRef.current = null;
            }
        },
        [resizeObserver],
    );

    // Edit global time
    const [globalTime, setGlobalTime] = React.useState(getFormatedTime(duration));
    React.useEffect(() => {
        setGlobalTime(getFormatedTime(duration));
    }, [duration]);

    const beginTimeRef = React.useRef(soundBeginTime);
    beginTimeRef.current = soundBeginTime;
    const onPlay = () => {
        previousTimeRef.current = null;
        let newTime = time;
        let prevTime: number | null = null;
        const animate = (dt: number) => {
            const deltaTime = prevTime !== null ? dt - prevTime : 0;
            prevTime = dt;
            newTime = Math.max(0, Math.min(duration, newTime + deltaTime));
            setTime(newTime);
            if (newTime < duration) {
                animationFrameRef.current = requestAnimationFrame(animate);
                onPlayAudio(newTime, beginTimeRef.current);
            } else {
                setIsPlaying(false);
                setTime(0);
                onStopAudio();
            }
        };
        animationFrameRef.current = requestAnimationFrame(animate);
        setIsPlaying(true);
    };
    const onStop = React.useCallback(() => {
        if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        onStopAudio();
        setIsPlaying(false);
    }, [onStopAudio]);
    // On component unmount, stop animation
    React.useEffect(() => {
        return onStop;
    }, [onStop]);

    // preload images
    const images = React.useMemo(() => {
        const i: string[] = [];
        for (const question of questions) {
            for (const plan of question.plans || []) {
                if (plan.imageUrl) {
                    i.push(plan.imageUrl);
                }
            }
        }
        return i;
    }, [questions]);

    const planStartDurations = React.useMemo(() => {
        const question = questions[0];
        if (!question) {
            return [];
        }
        let currentTime = question.title ? question.title.duration || 1000 : 0;
        return (question.plans || []).reduce<number[]>((acc, plan) => {
            acc.push(currentTime);
            currentTime += plan.duration || 1000;
            return acc;
        }, []);
    }, [questions]);
    const lastPlanStartTime = React.useMemo(() => planStartDurations[planStartDurations.length - 1] || 0, [planStartDurations]);

    const [deltaTime, setDeltaTime] = React.useState(0);
    const [draggedIndex, setDraggedIndex] = React.useState(0);
    const draggedIndexRef = React.useRef(draggedIndex); // use a following ref to get updated value in the drag handlers.
    draggedIndexRef.current = draggedIndex;
    const onMouseDown = () => {
        if (mountingTableWidth === 0 || isPlaying) {
            return; // no drag
        }
        let newDeltaTime = 0;
        const onMouseMove = (event: MouseEvent) => {
            newDeltaTime += (event.movementX * duration) / mountingTableWidth;
            const minTime = draggedIndexRef.current === 0 ? 1000 : planStartDurations[draggedIndexRef.current - 1] + 1000;
            const maxTime =
                draggedIndexRef.current + 1 === planStartDurations.length ? duration - 1000 : planStartDurations[draggedIndexRef.current + 1] - 1000;
            const x = planStartDurations[draggedIndexRef.current];
            setDeltaTime(Math.max(minTime - x, Math.min(maxTime - x, newDeltaTime)));
        };
        const onMouseUp = () => {
            const minTime = draggedIndexRef.current === 0 ? 1000 : planStartDurations[draggedIndexRef.current - 1] + 1000;
            const maxTime =
                draggedIndexRef.current + 1 === planStartDurations.length ? duration - 1000 : planStartDurations[draggedIndexRef.current + 1] - 1000;
            const x = planStartDurations[draggedIndexRef.current];
            const finalDeltaTime = Math.max(minTime - x, Math.min(maxTime - x, newDeltaTime));
            const newPlans = [...(questions[0].plans || [])];
            newPlans[draggedIndexRef.current].duration = (newPlans[draggedIndexRef.current].duration || 1000) - finalDeltaTime;
            let newTitle = questions[0].title;
            if (draggedIndexRef.current === 0 && newTitle) {
                newTitle = { ...newTitle, duration: (newTitle.duration || 1000) + finalDeltaTime };
            } else if (draggedIndexRef.current > 0) {
                newPlans[draggedIndexRef.current - 1].duration = (newPlans[draggedIndexRef.current - 1].duration || 1000) + finalDeltaTime;
            }
            const newQuestion = {
                ...questions[0],
                plans: newPlans,
                title: newTitle,
            };
            setDeltaTime(0);
            setQuestion(newQuestion);
            document.removeEventListener('mousemove', onMouseMove);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp, { once: true });
    };

    const onAddTime = () => {
        // try rounding the duration
        if (duration % 1000 !== 0) {
            updateLastDuration(1000 - (duration % 1000));
        } else {
            updateLastDuration(1000);
        }
    };

    const onRemoveTime = () => {
        if (duration > lastPlanStartTime + 1000) {
            const dt =
                lastPlanStartTime + 1000 - duration > -1000
                    ? lastPlanStartTime + 1000 - duration // go to last plan + 1000
                    : duration % 1000 !== 0 // or try rounding
                      ? -(duration % 1000)
                      : -1000;
            updateLastDuration(dt);
        }
    };

    const updateLastDuration = (delta: number) => {
        const question = questions[0];
        if (!question) {
            return;
        }
        const plans = question.plans || [];
        let newTitle = question.title;
        if (newTitle && plans.length === 0) {
            newTitle = { ...newTitle, duration: (newTitle.duration || 1000) + delta };
        }
        const newPlans = plans.map((plan, index) => (index === plans.length - 1 ? { ...plan, duration: (plan.duration || 1000) + delta } : plan));
        const newQuestion = {
            ...questions[0],
            plans: newPlans,
            title: newTitle,
        };
        setQuestion(newQuestion);
    };

    const [deltaSoundX, setDeltaSoundX] = React.useState(0);
    const deltaSound = mountingTableWidth === 0 ? 0 : (deltaSoundX * duration) / mountingTableWidth;
    const timeRef = React.useRef(time);
    timeRef.current = time;
    const onSoundMouseDown = (event: React.MouseEvent) => {
        if (mountingTableWidth === 0 || isPlaying) {
            return; // no drag
        }
        const initialX = event.clientX;
        const onMouseMove = (event: MouseEvent) => {
            const dx = Math.max(-mountingTableWidth / 2, Math.min(mountingTableWidth / 2, event.clientX - initialX));
            setDeltaSoundX(dx);
        };
        const onMouseUp = (event: MouseEvent) => {
            const dx = Math.max(-mountingTableWidth / 2, Math.min(mountingTableWidth / 2, event.clientX - initialX));
            const dt = (dx * duration) / mountingTableWidth;
            setSoundBeginTime(soundBeginTime + dt);
            setDeltaSoundX(0);
            onUpdateCurrentTime(timeRef.current, soundBeginTime + dt);
            document.removeEventListener('mousemove', onMouseMove);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp, { once: true });
    };

    const initialTimeRef = React.useRef(0);
    const onTimeMouseDown = () => {
        if (mountingTableWidth === 0 || isPlaying) {
            return; // no drag
        }
        let dt = 0;
        initialTimeRef.current = time;
        const onMouseMove = (event: MouseEvent) => {
            dt += (event.movementX * duration) / mountingTableWidth;
            setTime(Math.max(0, Math.min(duration, initialTimeRef.current + dt)));
        };
        const onMouseUp = () => {
            setTime(Math.max(0, Math.min(duration, initialTimeRef.current + dt)));
            document.removeEventListener('mousemove', onMouseMove);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp, { once: true });
    };

    // Use onPlay following ref to avoid dependency change on function change.
    const [isHovered, setIsHovered] = React.useState(false);
    const onPlayRef = React.useRef(onPlay);
    onPlayRef.current = onPlay;
    React.useEffect(() => {
        if (!isHovered) {
            return () => {};
        }

        const onKeyPress = (event: KeyboardEvent) => {
            if (event.key === ' ' || event.key === 'Spacebar') {
                event.preventDefault();
                if (!isPlaying) {
                    onPlayRef.current();
                } else {
                    onStop();
                }
            }
        };
        window.addEventListener('keypress', onKeyPress);
        return () => {
            window.removeEventListener('keypress', onKeyPress);
        };
    }, [isHovered, isPlaying, onPlayRef, onStop]);

    return (
        <div
            onMouseEnter={() => {
                setIsHovered(true);
            }}
            onMouseLeave={() => {
                setIsHovered(false);
            }}
        >
            <Head>
                {images.map((image, index) => (
                    <link key={index} rel="preload" as="image" href={image}></link>
                ))}
            </Head>
            <div className={styles.DiaporamaPlayer__container}>
                <KeepRatio ratio={9 / 16} className={styles.DiaporamaPlayer}>
                    <div
                        className={`${styles.DiaporamaPlayer__playButton} ${isPlaying ? styles['DiaporamaPlayer__playButton--playing'] : ''}`}
                        onClick={() => {
                            if (!isPlaying) {
                                onPlay();
                            } else {
                                onStop();
                            }
                        }}
                    >
                        <div className={styles.DiaporamaPlayer__squareButton}>
                            {isPlaying ? (
                                <PauseIcon style={{ width: '50px', height: '50px' }} />
                            ) : (
                                <PlayIcon style={{ width: '50px', height: '50px' }} />
                            )}
                        </div>
                    </div>
                    <Frame questions={questions} time={time} className={styles.DiaporamaPlayer__frame} />
                </KeepRatio>
                <p className={styles.DiaporamaPlayer__timer}>{getFormatedTime(time)}</p>
            </div>
            <div className={styles.DiaporamaPlayer__mountingTable}>
                <div className={styles.DiaporamaPlayer__globalTime}>
                    <p style={{ width: '100px', textAlign: 'center' }}>00:00:00</p>
                    <div className={styles.DiaporamaPlayer__timeEdit}>
                        {canEditPlans && (
                            <IconButton
                                icon={MinusIcon}
                                color="primary"
                                variant="contained"
                                aria-label="reduce duration"
                                size="sm"
                                disabled={duration <= lastPlanStartTime + 1000}
                                onClick={onRemoveTime}
                            ></IconButton>
                        )}
                        {canEditPlans ? (
                            <Input
                                value={globalTime}
                                size="sm"
                                marginY="none"
                                marginX="xs"
                                style={{
                                    width: '74px',
                                    color: 'white',
                                    backgroundColor: 'transparent',
                                }}
                                onChange={(event) => {
                                    if (/^[\d|:]*$/.test(event.target.value)) {
                                        setGlobalTime(event.target.value);
                                    }
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                        if (document && document.activeElement && 'blur' in document.activeElement) {
                                            (document.activeElement as HTMLInputElement).blur();
                                        }
                                    }
                                }}
                                onBlur={(event) => {
                                    const question = questions[0];
                                    const times = event.target.value.split(':');
                                    const newDuration =
                                        60000 * Math.min(99, Number(times[0]) || 0) +
                                        1000 * Math.min(99, Number(times[1]) || 0) +
                                        10 * Math.min(99, Number(times[2]) || 0);
                                    const count = (question.title ? 1 : 0) + (question.plans || []).length;
                                    if (!question || newDuration === duration || newDuration < count * 1000) {
                                        setGlobalTime(getFormatedTime(duration));
                                        if (question && newDuration !== duration && newDuration < count * 1000) {
                                            sendToast({ message: `Time can't be below: ${getFormatedTime(count * 1000)}`, type: 'error' });
                                        }
                                        return;
                                    } else {
                                        const delta = newDuration - duration;
                                        const count = (question.title ? 1 : 0) + (question.plans || []).length;
                                        if (Math.abs(delta) < 1000 * count) {
                                            updateLastDuration(delta);
                                        } else {
                                            const dt = newDuration / count;
                                            const plans = question.plans || [];
                                            const newTitle = question.title;
                                            if (newTitle) {
                                                newTitle.duration = dt;
                                            }
                                            const newPlans = plans.map((plan) => ({ ...plan, duration: dt }));
                                            const newQuestion = {
                                                ...questions[0],
                                                plans: newPlans,
                                                title: newTitle,
                                            };
                                            setQuestion(newQuestion);
                                        }
                                    }
                                }}
                            />
                        ) : (
                            <p style={{ margin: '0 5px' }}>{getFormatedTime(duration)}</p>
                        )}
                        {canEditPlans && (
                            <IconButton
                                color="primary"
                                variant="contained"
                                aria-label="increase duration"
                                size="sm"
                                onClick={onAddTime}
                                icon={PlusIcon}
                            ></IconButton>
                        )}
                    </div>
                </div>
                <div className={styles.DiaporamaPlayer__globalTracks}>
                    <div className={styles.DiaporamaPlayer__icons}>
                        {canEditPlans && (
                            <span>
                                <ImageIcon color="#00ADEF" />
                            </span>
                        )}
                        <span>
                            <SpeakerLoudIcon color="#DEDFE3" />
                        </span>
                    </div>
                    <div
                        className={styles.DiaporamaPlayer__tableTime}
                        ref={onMountingTableRef}
                        id={PLAYER_ID}
                        onMouseDown={(event) => {
                            if (!mountingTableRef.current || isPlaying) {
                                return;
                            }
                            const { width, left } = mountingTableRef.current.getBoundingClientRect();
                            const dY = event.clientX - left;
                            const newTime = Math.max(0, Math.min(duration, duration * (dY / width)));
                            onUpdateCurrentTime(newTime, soundBeginTime);
                            setTime(newTime);
                        }}
                    >
                        {canEditPlans && questions.length > 0 && (
                            <div className={styles.DiaporamaPlayer__mountingPlans}>
                                {questions[0].title && (
                                    <div
                                        style={{ flexGrow: (questions[0].title.duration || 1000) + (draggedIndex === 0 ? deltaTime : 0) }}
                                        className={styles.DiaporamaPlayer__mountingPlan}
                                    >
                                        <div className={styles.DiaporamaPlayer__mountingPlanTitleFrame}>Titre</div>
                                    </div>
                                )}
                                {(questions[0].plans || []).map((plan, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            flexGrow:
                                                (plan.duration || 1000) +
                                                (draggedIndex === index + 1 ? deltaTime : draggedIndex === index ? -deltaTime : 0),
                                        }}
                                        className={styles.DiaporamaPlayer__mountingPlan}
                                    >
                                        {(index > 0 || questions[0].title !== null) && (
                                            <>
                                                <div className={styles.planFrameWhiteBorder}>
                                                    <div
                                                        className={styles.dragButton}
                                                        onMouseDown={(event) => {
                                                            event.preventDefault();
                                                            event.stopPropagation();
                                                            setDraggedIndex(index);
                                                            onMouseDown();
                                                        }}
                                                    >
                                                        <CodeIcon style={{ width: '16px', height: '16px' }} />
                                                    </div>
                                                </div>
                                                <div className={styles.planFrameTiming}>
                                                    {getFormatedTime((draggedIndex === index ? deltaTime : 0) + (planStartDurations[index] || 0))}
                                                </div>
                                            </>
                                        )}
                                        <div className={styles.DiaporamaPlayer__mountingPlanFrame}>
                                            {plan.imageUrl && <Image unoptimized layout="fill" objectFit="contain" src={plan.imageUrl} />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className={`${styles.DiaporamaPlayer__mountingSounds} ${soundUrl ? styles.green : ''}`}>
                            {soundUrl && (
                                <>
                                    <WaveForm
                                        soundUrl={soundUrl}
                                        time={time}
                                        duration={duration}
                                        volume={volume}
                                        beginTime={soundBeginTime + deltaSound}
                                        onUpdateSequenceDuration={(audioDuration) => {
                                            if (!canEditPlans || duration >= audioDuration || soundUrl === questions[0]?.soundUrl) {
                                                return;
                                            }
                                            updateLastDuration(audioDuration - duration);
                                        }}
                                    />
                                    {canEdit && (
                                        <div className={styles.soundWhiteBorder} style={{ transform: `translate(${deltaSoundX}px, 0px)` }}>
                                            <div
                                                className={styles.dragButton}
                                                onMouseDown={(event) => {
                                                    event.preventDefault();
                                                    event.stopPropagation();
                                                    onSoundMouseDown(event);
                                                }}
                                            >
                                                <CodeIcon style={{ width: '16px', height: '16px' }} />
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        {duration > 0 && (
                            <div
                                className={styles.DiaporamaPlayer__time}
                                onMouseDown={onTimeMouseDown}
                                style={{ left: `${(time / duration) * 100}%` }}
                            />
                        )}
                    </div>

                    <div className={styles.DiaporamaPlayer__volume}>
                        {canEdit && (
                            <>
                                <SpeakerLoudIcon color="white" />
                                <Slider
                                    marginY="sm"
                                    value={volume}
                                    onChange={(newValue: number) => {
                                        setVolume(newValue);
                                        onUpdateVolume(newValue);
                                    }}
                                    max={300}
                                    min={0}
                                    orientation="vertical"
                                />
                                <SpeakerQuietIcon color="white" />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
