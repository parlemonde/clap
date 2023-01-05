import Head from 'next/head';
import Image from 'next/image';
import React from 'react';

import AddIcon from '@mui/icons-material/Add';
import Camera from '@mui/icons-material/CameraAlt';
import CodeIcon from '@mui/icons-material/Code';
import Pause from '@mui/icons-material/Pause';
import PlayArrow from '@mui/icons-material/PlayArrow';
import RemoveIcon from '@mui/icons-material/Remove';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';
import { IconButton, Slider } from '@mui/material';

import { Frame } from './Frame';
import { WaveForm } from './WaveForm';
import { getFormatedTime } from './lib/get-formatted-time';
import { getProjectDuration } from './lib/get-project-duration';
import { useAudio } from './useAudio';
import { KeepRatio } from 'src/components/layout/KeepRatio';
import { useDragHandler } from 'src/hooks/useDragHandler';
import { useFollowingRef } from 'src/hooks/useFollowingRef';
import { useResizeObserver } from 'src/hooks/useResizeObserver';
import type { Question } from 'types/models/question.type';

type DiaporamaPlayerProps = {
    questions: Question[];
    volume: number;
    soundUrl: string;
    soundBeginTime: number;
    canEdit?: boolean;
    canEditPlans?: boolean;
    setQuestion?: (newQuestion: Question) => void;
    setSoundBeginTime: (newSoundBeginTime: number) => void;
    setVolume: (newVolume: number) => void;
};
export const DiaporamaPlayer = ({
    questions,
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
    const { onPlay: onPlayAudio, onStop: onStopAudio, onUpdateVolume, onUpdateCurrentTime } = useAudio(soundUrl, volume);
    const [mountingTableRef, { width: mountingTableWidth }] = useResizeObserver<HTMLDivElement>();
    const mountingPlansWidth = mountingTableWidth - 4; // 2 borders of 2px.
    const animationFrameRef = React.useRef<number | null>(null);
    const previousTimeRef = React.useRef<number | null>(null);
    const duration = React.useMemo(() => getProjectDuration(questions), [questions]);

    const beginTimeRef = useFollowingRef(soundBeginTime);
    const animate = (time: number) => {
        const deltaTime = previousTimeRef.current !== null ? time - previousTimeRef.current : 0;
        previousTimeRef.current = time;
        setTime((prevTime) => {
            const newTime = Math.max(0, Math.min(duration, prevTime + deltaTime));
            if (newTime < duration) {
                animationFrameRef.current = requestAnimationFrame(animate);
                if (newTime >= beginTimeRef.current) {
                    onPlayAudio();
                }
                return newTime;
            } else {
                setIsPlaying(false);
                onStopAudio();
                return 0;
            }
        });
    };
    const onPlay = () => {
        previousTimeRef.current = null;
        animationFrameRef.current = requestAnimationFrame(animate);
        onUpdateCurrentTime(time, soundBeginTime);
        setIsPlaying(true);
    };
    const onStop = React.useCallback(() => {
        if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        onStopAudio();
        setIsPlaying(false);
    }, [onStopAudio]);
    // On component unmout, stop animation
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
        let currentTime = question.title ? question.title.duration : 0;
        return (question.plans || []).reduce<number[]>((acc, plan) => {
            acc.push(currentTime);
            currentTime += plan.duration || 0;
            return acc;
        }, []);
    }, [questions]);
    const lastPlanStartTime = React.useMemo(() => planStartDurations[planStartDurations.length - 1] || 0, [planStartDurations]);

    const [deltaTime, setDeltaTime] = React.useState(0);
    const [draggedIndex, setDraggedIndex] = React.useState(0);
    const draggedIndexRef = useFollowingRef(draggedIndex); // use a following ref to get updated value in the drag handlers.
    const mouseDelta = React.useRef(0);
    const { onMouseDown } = useDragHandler({
        onDragStart(event) {
            mouseDelta.current = event.clientX;
            return mountingPlansWidth !== 0;
        },
        onDrag(event) {
            if (mountingPlansWidth === 0) {
                return;
            }
            const minTime = draggedIndexRef.current === 0 ? 1000 : planStartDurations[draggedIndexRef.current - 1] + 1000;
            const maxTime =
                draggedIndexRef.current + 1 === planStartDurations.length ? duration - 1000 : planStartDurations[draggedIndexRef.current + 1] - 1000;
            const x = planStartDurations[draggedIndexRef.current];
            const deltaTime = Math.max(minTime - x, Math.min(maxTime - x, ((event.clientX - mouseDelta.current) * duration) / mountingPlansWidth));
            setDeltaTime(deltaTime);
        },
        onDragEnd(event) {
            const minTime = draggedIndexRef.current === 0 ? 1000 : planStartDurations[draggedIndexRef.current - 1] + 1000;
            const maxTime =
                draggedIndexRef.current + 1 === planStartDurations.length ? duration - 1000 : planStartDurations[draggedIndexRef.current + 1] - 1000;
            const x = planStartDurations[draggedIndexRef.current];
            const deltaTime = Math.max(minTime - x, Math.min(maxTime - x, ((event.clientX - mouseDelta.current) * duration) / mountingPlansWidth));
            const newPlans = [...(questions[0].plans || [])];
            newPlans[draggedIndexRef.current].duration = (newPlans[draggedIndexRef.current].duration || 0) - deltaTime;
            let newTitle = questions[0].title;
            if (draggedIndexRef.current === 0 && newTitle !== null) {
                newTitle = { ...newTitle, duration: newTitle.duration + deltaTime };
            } else if (draggedIndexRef.current > 0) {
                newPlans[draggedIndexRef.current - 1].duration = (newPlans[draggedIndexRef.current - 1].duration || 0) + deltaTime;
            }
            const newQuestion = {
                ...questions[0],
                plans: newPlans,
                title: newTitle,
            };
            setDeltaTime(0);
            setQuestion(newQuestion);
        },
    });

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
            newTitle = { ...newTitle, duration: newTitle.duration + delta };
        }
        const newPlans = plans.map((plan, index) => (index === plans.length - 1 ? { ...plan, duration: (plan.duration || 0) + delta } : plan));
        const newQuestion = {
            ...questions[0],
            plans: newPlans,
            title: newTitle,
        };
        setQuestion(newQuestion);
    };

    const [deltaSoundX, setDeltaSoundX] = React.useState(0);
    const deltaSound = mountingPlansWidth === 0 ? 0 : (deltaSoundX * duration) / mountingPlansWidth;
    const timeRef = useFollowingRef(time);
    const { onMouseDown: onSoundMouseDown } = useDragHandler({
        onDragStart(event) {
            mouseDelta.current = event.clientX;
            return mountingPlansWidth !== 0;
        },
        onDrag(event) {
            const dx = Math.max(-mountingPlansWidth / 2, Math.min(mountingPlansWidth / 2, event.clientX - mouseDelta.current));
            setDeltaSoundX(dx);
        },
        onDragEnd(event) {
            const dx = Math.max(-mountingPlansWidth / 2, Math.min(mountingPlansWidth / 2, event.clientX - mouseDelta.current));
            const dt = (dx * duration) / mountingPlansWidth;
            setSoundBeginTime(soundBeginTime + dt);
            setDeltaSoundX(0);
            onUpdateCurrentTime(timeRef.current, soundBeginTime + dt);
        },
    });

    return (
        <>
            <Head>
                {images.map((image, index) => (
                    <link key={index} rel="preload" as="image" href={image}></link>
                ))}
            </Head>
            <div className="diaporama-player-container">
                <KeepRatio ratio={9 / 16} className="diaporama-player">
                    <div
                        className={`diaporama-play-btn ${isPlaying ? 'playing' : ''}`}
                        onClick={() => {
                            if (!isPlaying) {
                                onPlay();
                            } else {
                                onStop();
                            }
                        }}
                    >
                        <div className="square-btn">{isPlaying ? <Pause sx={{ fontSize: '50px' }} /> : <PlayArrow sx={{ fontSize: '50px' }} />}</div>
                    </div>
                    <Frame questions={questions} time={time} />
                </KeepRatio>
                <p className="player-timer">{getFormatedTime(time)}</p>
            </div>
            <div className="diaporama-mounting-table">
                <div className="diaporama-global-time">
                    <p style={{ width: '100px', textAlign: 'center' }}>00:00:00</p>
                    <div className="diaporama-time-edit">
                        {canEditPlans && (
                            <IconButton
                                sx={{
                                    color: 'white',
                                    backgroundColor: (theme) => theme.palette.primary.main,
                                    padding: '2px',
                                    '&:hover': {
                                        backgroundColor: (theme) => theme.palette.primary.dark,
                                    },
                                }}
                                color="primary"
                                aria-label="reduce duration"
                                size="small"
                                disabled={duration <= lastPlanStartTime + 1000}
                                onClick={onRemoveTime}
                            >
                                <RemoveIcon fontSize="inherit" />
                            </IconButton>
                        )}
                        <p style={{ margin: '0 5px' }}>{getFormatedTime(duration)}</p>
                        {canEditPlans && (
                            <IconButton
                                sx={{
                                    color: 'white',
                                    backgroundColor: (theme) => theme.palette.primary.main,
                                    padding: '2px',
                                    '&:hover': {
                                        backgroundColor: (theme) => theme.palette.primary.dark,
                                    },
                                }}
                                color="primary"
                                aria-label="increase duration"
                                size="small"
                                onClick={onAddTime}
                            >
                                <AddIcon fontSize="inherit" />
                            </IconButton>
                        )}
                    </div>
                </div>
                <div className="diaporama-global-tracks">
                    <div className="diaporama-icons">
                        {canEditPlans && (
                            <span>
                                <Camera htmlColor="#00ADEF" />
                            </span>
                        )}
                        <span>
                            <VolumeUp htmlColor="#DEDFE3" />
                        </span>
                    </div>
                    <div
                        className="diaporama-table-time"
                        ref={mountingTableRef}
                        onMouseDown={(event) => {
                            if (!mountingTableRef.current) {
                                return;
                            }
                            const { width, left } = mountingTableRef.current.getBoundingClientRect();
                            const dY = event.clientX - left;
                            const newTime = Math.max(0, Math.min(duration, duration * (dY / (width - 4))));
                            onUpdateCurrentTime(newTime, soundBeginTime);
                            setTime(newTime);
                        }}
                    >
                        {canEditPlans && questions.length > 0 && (
                            <div className="diaporama-mounting-plans">
                                {questions[0].title !== null && (
                                    <div
                                        style={{ flexGrow: questions[0].title.duration + (draggedIndex === 0 ? deltaTime : 0) }}
                                        className="diaporama-mounting-plan"
                                    >
                                        <div className="diaporama-mounting-plan-title-frame">Titre</div>
                                    </div>
                                )}
                                {(questions[0].plans || []).map((plan, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            flexGrow:
                                                (plan.duration || 0) +
                                                (draggedIndex === index + 1 ? deltaTime : draggedIndex === index ? -deltaTime : 0),
                                        }}
                                        className="diaporama-mounting-plan"
                                    >
                                        {(index > 0 || questions[0].title !== null) && (
                                            <>
                                                <div className="plan-frame-white-border">
                                                    <div
                                                        className="drag-button"
                                                        onMouseDown={(event) => {
                                                            event.preventDefault();
                                                            event.stopPropagation();
                                                            setDraggedIndex(index);
                                                            onMouseDown(event);
                                                        }}
                                                    >
                                                        <CodeIcon fontSize="inherit" />
                                                    </div>
                                                </div>
                                                <div className="plan-frame-timing">
                                                    {getFormatedTime((draggedIndex === index ? deltaTime : 0) + (planStartDurations[index] || 0))}
                                                </div>
                                            </>
                                        )}
                                        <div className="diaporama-mounting-plan-frame">
                                            {plan.imageUrl && <Image unoptimized layout="fill" objectFit="contain" src={plan.imageUrl} />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className={`diaporama-mounting-sounds ${soundUrl ? 'green' : ''}`}>
                            {soundUrl && (
                                <>
                                    <WaveForm
                                        soundUrl={soundUrl}
                                        time={time}
                                        duration={duration}
                                        volume={volume}
                                        beginTime={soundBeginTime + deltaSound}
                                    />
                                    {canEdit && (
                                        <div className="sound-white-border" style={{ transform: `translate(${deltaSoundX}px, 0px)` }}>
                                            <div
                                                className="drag-button"
                                                onMouseDown={(event) => {
                                                    event.preventDefault();
                                                    event.stopPropagation();
                                                    onSoundMouseDown(event);
                                                }}
                                            >
                                                <CodeIcon fontSize="inherit" />
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        {duration > 0 && <div className="diaporama-time" style={{ left: `${(time / duration) * 100}%` }} />}
                    </div>

                    <div className="diaporama-volume">
                        {canEdit && (
                            <>
                                <VolumeUp htmlColor="white" />
                                <Slider
                                    value={volume}
                                    onChange={(_: Event, newValue: number | number[]) => {
                                        if (typeof newValue !== 'number') {
                                            return;
                                        }
                                        setVolume(newValue);
                                        onUpdateVolume(newValue);
                                    }}
                                    max={100}
                                    min={0}
                                    sx={{
                                        margin: '8px 0',
                                        '.MuiSlider-rail': {
                                            backgroundColor: 'rgb(200, 200, 200)',
                                        },
                                        '& input[type="range"]': {
                                            WebkitAppearance: 'slider-vertical',
                                        },
                                    }}
                                    orientation="vertical"
                                    aria-label="volume"
                                    valueLabelDisplay="auto"
                                    onKeyDown={(event: React.KeyboardEvent) => {
                                        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                                            event.preventDefault();
                                        }
                                    }}
                                />
                                <VolumeDown htmlColor="white" />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
