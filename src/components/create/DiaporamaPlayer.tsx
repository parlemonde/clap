import React from 'react';

import Camera from '@mui/icons-material/CameraAlt';
import Pause from '@mui/icons-material/Pause';
import PlayArrow from '@mui/icons-material/PlayArrow';
import Sound from '@mui/icons-material/VolumeUp';

import { TimeEdit } from 'src/components/create/TimeEdit';
import { ProjectServiceContext } from 'src/services/useProject';
import type { Plan } from 'types/models/plan.type';
import type { Question } from 'types/models/question.type';
import type { Title } from 'types/models/title.type';

interface DiaporamaPlayerProps {
    questions: Question[];
    mountingPlans: boolean;
    videoOnly: boolean;
    questionIndex: number;
}

export const DiaporamaPlayer: React.FunctionComponent<DiaporamaPlayerProps> = ({
    questions,
    mountingPlans,
    questionIndex,
    videoOnly = false,
}: DiaporamaPlayerProps) => {
    const { updateProject, project } = React.useContext(ProjectServiceContext);
    const diaporamaRef = React.useRef(null);
    const mountingTableRef = React.useRef<HTMLDivElement | null>(null);
    const [currentId, setCurrentId] = React.useState(0);
    const [spentTime, setSpentTime] = React.useState(0);
    const [isPlaying, setPlaying] = React.useState(false);
    const [dragCursor, setDragCursor] = React.useState(false);
    const [dragIndex, setDragIndex] = React.useState(0);
    const [audio, setAudio] = React.useState<HTMLAudioElement | null>(null);
    const [volume, setVolume] = React.useState(100);
    const [dragSound, setDragSound] = React.useState(false);
    const [startDragSound, setStartDragSound] = React.useState(0);
    let time = 0;

    /* voiceOff logic when playing the whole project */
    const [voiceOffPath, setVoiceOffPath] = React.useState('');
    const [voiceOffIndex, setVoiceOffIndex] = React.useState(-1);
    const [voiceOffStart, setVoiceOffStart] = React.useState(-1);
    const [voiceOffAudio, setVoiceOffAudio] = React.useState<HTMLAudioElement | null>(null);

    const updateQuestion = (newQuestion: Partial<Question>) => {
        const q = project.questions || [];
        const prevQuestion = q[questionIndex];
        q[questionIndex] = { ...prevQuestion, ...newQuestion };
        updateProject({ questions: q });
    };

    const getCurrentSound = React.useCallback(() => {
        if (mountingPlans) {
            if (questions[0] != null && questions[0].sound != null) return questions[0].sound;
        } else {
            if (project.sound != null) return project.sound;
        }
        return {
            id: 0,
            path: '',
            uuid: '',
            localPath: null,
            volume: 100,
        };
    }, [mountingPlans, questions, project.sound]);

    const getBeginTime = React.useCallback(() => {
        if (mountingPlans) {
            if (questions[0] == null) return 0;
            return questions[0].voiceOffBeginTime;
        } else {
            if (project == null) return 0;
            return project.musicBeginTime;
        }
    }, [mountingPlans, project, questions]);

    const setIsPlaying = React.useCallback(
        (p: boolean) => {
            setPlaying(p);
            if (p) {
                if (audio == null && getCurrentSound().path != '') {
                    const a = new Audio(getCurrentSound().path);
                    a.currentTime = (spentTime - getBeginTime()) / 1000;
                    a.play();
                    setAudio(a);
                }
                if (audio != null && (spentTime - getBeginTime()) / 1000 > 0) {
                    audio.play();
                    audio.currentTime = (spentTime - getBeginTime()) / 1000;
                }
                if (voiceOffAudio != null) {
                    voiceOffAudio.play();
                }
            } else {
                if (audio != null) {
                    audio.pause();
                }
                if (voiceOffAudio != null) {
                    voiceOffAudio?.pause();
                }
            }
        },
        [audio, getBeginTime, getCurrentSound, spentTime, voiceOffAudio],
    );

    React.useEffect(() => {
        const sound = getCurrentSound();
        if (sound != null && audio == null && sound.path != '') {
            const a = new Audio(sound.path);
            a.currentTime = (spentTime - getBeginTime()) / 1000;
            setAudio(a);
        }
    }, [getCurrentSound, setAudio, getBeginTime, spentTime, audio]);

    const getCurrentPlan = (spent: number) => {
        let time = 0;
        let index = -1;
        if (diaporamaRef.current != null) {
            Array.from((diaporamaRef.current as HTMLElement).children).map((q) => {
                if (time <= spent) {
                    index++;
                    time += parseInt(q.getAttribute('data-duration') as string);
                }
            });
        }
        return index < 0 ? 0 : index;
    };

    const getTotalDuration = React.useCallback(() => {
        let time = 0;
        questions.map((q) => {
            time += q != null && q.duration != null ? q.duration : 0;
        });
        return time;
    }, [questions]);

    const playCurrentVoiceOff = React.useCallback(() => {
        if (!isPlaying) return;
        let time = 0;
        let path = '';
        let index = 0;
        let start = 0;
        questions.map((q, i) => {
            const beginTime = time;
            if (q.title != null) {
                if (time <= spentTime && q.sound != null) {
                    path = q.sound.path;
                    index = i;
                    start = beginTime;
                }
                time += q.title.duration;
            }
            if (q.plans != null) {
                q.plans.map((p) => {
                    if (time <= spentTime && q.sound != null) {
                        path = q.sound.path;
                        index = i;
                        start = beginTime;
                    }
                    if (p.duration) time += p.duration;
                });
            }
        });
        if (path != '') {
            if (voiceOffPath != path) {
                if (voiceOffAudio != null) voiceOffAudio.pause();
                const a = new Audio(path);
                const currentTime = (spentTime - start - questions[index].voiceOffBeginTime) / 1000;
                if (currentTime >= 0) a.currentTime = currentTime;
                a.play();
                setVoiceOffAudio(a);
                setVoiceOffPath(path);
                setVoiceOffIndex(index);
                setVoiceOffStart(start);
            }
        }
    }, [spentTime, isPlaying, questions, voiceOffAudio, voiceOffPath, setVoiceOffPath, setVoiceOffAudio, setVoiceOffIndex, setVoiceOffStart]);

    React.useEffect(() => {
        const interval = setInterval(() => {
            if (diaporamaRef === null) return;
            if (spentTime >= getTotalDuration()) {
                setSpentTime(0);
                if (audio != null) audio.currentTime = 0 - getBeginTime();
                return setIsPlaying(false);
            }
            if (isPlaying) {
                setSpentTime(spentTime + 10);
                if ((spentTime - getBeginTime()) / 1000 > 0 && audio != null) {
                    audio.play();
                }
            }
            if (diaporamaRef.current != null) {
                const current = (diaporamaRef.current as HTMLDivElement).children[currentId] as HTMLDivElement;
                current.style.display = 'block';
                const plan = getCurrentPlan(spentTime);
                if (!mountingPlans) playCurrentVoiceOff();
                if (plan !== currentId) {
                    current.style.display = 'none';
                    setCurrentId(plan);
                }
            }
        }, 10);
        return () => clearInterval(interval);
    }, [diaporamaRef, currentId, spentTime, isPlaying, audio, mountingPlans, getBeginTime, getTotalDuration, setIsPlaying, playCurrentVoiceOff]);

    React.useEffect(() => {
        document.onkeydown = (e: KeyboardEvent) => {
            if (e.keyCode === 32 && !(e.target != null && ['TEXTAREA'].includes((e.target as Element).tagName))) {
                e.preventDefault();
                setIsPlaying(!isPlaying);
            }
        };
    }, [setIsPlaying, isPlaying]);

    React.useEffect(() => {
        return () => {
            if (audio != null) audio.pause();
            if (voiceOffAudio != null) voiceOffAudio.pause();
        };
    }, [audio]);

    const getFormatedTime = (t: number) => {
        const minutes = Math.floor(t / 60000);
        const seconds = (t - minutes * 60000) / 1000;
        const centi = Math.floor(t / 10);
        return `${('0' + minutes).slice(-2)}:${('0' + Math.floor(seconds)).slice(-2)}:${('0' + centi).slice(-2)}`;
    };

    const moveTimerCursor = (e: React.MouseEvent) => {
        if (mountingTableRef.current == null) return;
        const rect = (mountingTableRef.current as HTMLDivElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        let time = (x * getTotalDuration()) / rect.width;
        if (time < 0) time = 0;
        if (time > getTotalDuration()) time = getTotalDuration() - 10;
        if (audio != null) {
            if ((time - getBeginTime()) / 1000) audio.pause();
            audio.currentTime = (time - getBeginTime()) / 1000;
        }
        if (voiceOffAudio != null) {
            const currentTime = (spentTime - voiceOffStart - questions[voiceOffIndex].voiceOffBeginTime) / 1000;
            if (currentTime >= 0) voiceOffAudio.currentTime = currentTime;
        }
        setSpentTime(time);
    };

    const handleMoveCursor = (e: React.MouseEvent) => {
        if (!dragCursor || mountingTableRef.current == null) return;
        const rect = (mountingTableRef.current as HTMLDivElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        let time = (x * getTotalDuration()) / rect.width;
        let i = 0;
        let j = 0;
        let timeBefore = 0;
        let nbElemAfter = 0;
        let elem: Title | Plan | null = null;
        for (const q of questions) {
            if (q.title != null) {
                i++;
                if (i == dragIndex) elem = q.title;
                else if (elem === null) timeBefore += q.title.duration;
                if (i > dragIndex) nbElemAfter++;
            }
            if (q.plans == null) return;
            for (const p of q.plans) {
                i++;
                if (i == dragIndex) elem = p;
                else if (elem === null && p.duration != null) timeBefore += p.duration;
                if (i > dragIndex) nbElemAfter++;
            }
        }
        if (elem == null) {
            return;
        }
        time -= timeBefore; // Get the new duration of the plan
        const diff = Math.floor(time - (elem.duration || 0)); // Calculate the diff between before and after moving
        elem.duration = time; // We now set the new duration
        const toAdd = Math.floor(diff / nbElemAfter); // Calculate how much to add on the other plans
        questions.map((q) => {
            if (q.title != null) {
                j++; // We only add the time after the plan, only if it's inside the total duration
                if (j > dragIndex && q.title.duration - toAdd < getTotalDuration()) q.title.duration -= toAdd;
            }
            if (q.plans == null) return;
            q.plans.map((p) => {
                j++;
                if (j > dragIndex && p.duration !== null && p.duration - toAdd < getTotalDuration()) p.duration -= toAdd;
            });
        });
        updateQuestion(questions[0]);
    };

    const getAudioDuration = () => {
        if (audio == null || mountingTableRef.current == null) return 1000;
        return (audio.duration * 1000 * (mountingTableRef.current as HTMLDivElement).getBoundingClientRect().width) / getTotalDuration();
    };

    const getAudioPosition = () => {
        if (audio == null || mountingTableRef.current == null) return 0;
        let start: number | null = 0;
        if (mountingPlans) {
            if (questions[0] != null) start = questions[0].voiceOffBeginTime;
        } else {
            if (project != null) start = project.musicBeginTime;
        }
        if (start == null) return 0;
        return (start * (mountingTableRef.current as HTMLDivElement).getBoundingClientRect().width) / getTotalDuration();
    };

    const moveAudio = (e: React.MouseEvent) => {
        if (!dragSound || mountingTableRef.current == null) return;
        const rect = (mountingTableRef.current as HTMLDivElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const time = ((x - startDragSound) * getTotalDuration()) / rect.width;
        setStartDragSound(x);
        if (mountingPlans) {
            questions[0].voiceOffBeginTime += time;
            updateQuestion(questions[0]);
        } else {
            project.musicBeginTime += time;
            updateProject({ musicBeginTime: project.musicBeginTime });
        }
        if (audio != null) audio.currentTime = (spentTime - getBeginTime()) / 1000;
    };

    const addTotalTime = (qte: number) => {
        if (questions[0].duration + qte <= 0 || questions[0] == null || diaporamaRef.current == null) return;
        questions[0].duration += qte;
        const c = Array.from((diaporamaRef.current as HTMLElement).children).length;
        questions.map((q) => {
            if (q.title != null) {
                q.title.duration += qte / c;
            }
            if (q.plans == null) return;
            q.plans.map((p) => {
                if (p.duration == null) p.duration = 3000;
                p.duration += qte / c;
            });
        });
        updateQuestion(questions[0]);
    };

    const updateVolume = (vol: number) => {
        if (mountingPlans) {
            if (questions[0].sound != null) questions[0].sound.volume = vol;
        } else {
            if (project.sound != null) project.sound.volume = vol;
        }
    };

    return (
        <div className="diaporama-player-container">
            <div className="diaporama-player">
                <div
                    className={`diaporama-play-btn ${isPlaying ? 'playing' : ''}`}
                    onClick={() => {
                        setIsPlaying(!isPlaying);
                    }}
                >
                    <div className="square-btn">{isPlaying ? <Pause /> : <PlayArrow />}</div>
                </div>

                <div className="diaporama-plans" ref={diaporamaRef}>
                    {questions.map((question, index) => {
                        const style =
                            question === null || question.title == null || question.title.style === '' ? null : JSON.parse(question.title.style);
                        return question == null ? null : (
                            <>
                                {question.title == null ? null : (
                                    <div
                                        key={`title-${index}`}
                                        className="diaporama-title"
                                        data-duration={question.title.duration}
                                        style={
                                            style === {}
                                                ? {}
                                                : {
                                                      fontFamily: style.fontFamily,
                                                      left: `${style.left}%`,
                                                      top: `${style.top}%`,
                                                  }
                                        }
                                    >
                                        <p>{question.title.text}</p>
                                    </div>
                                )}
                                {question.plans?.map((p) => {
                                    return (
                                        <div
                                            key={(Math.random() + 1).toString(36)}
                                            className="diaporama-plan"
                                            style={{ backgroundImage: `url('${p.url}')` }}
                                            data-duration={p.duration}
                                        ></div>
                                    );
                                })}
                            </>
                        );
                    })}
                </div>
                <p className="player-timer">{getFormatedTime(spentTime)}</p>
            </div>
            {videoOnly ? null : (
                <div
                    className="diaporama-mounting-table"
                    onMouseUp={() => {
                        setDragCursor(false);
                    }}
                >
                    <div className="diaporama-global-time">
                        <p>00:00:00</p>
                        {mountingPlans ? (
                            <div className="diaporama-time-edit">
                                <button onClick={() => addTotalTime(-1000)}>-</button>
                                <TimeEdit totalTime={getTotalDuration()} updateTime={addTotalTime} />
                                <button onClick={() => addTotalTime(1000)}>+</button>
                            </div>
                        ) : (
                            <p>{getFormatedTime(getTotalDuration())}</p>
                        )}
                    </div>
                    <div>
                        <div className="diaporama-icons">
                            {mountingPlans ? <Camera /> : null}
                            <Sound />
                        </div>
                        <div
                            className="diaporama-table-time"
                            ref={mountingTableRef}
                            onMouseDown={moveTimerCursor}
                            onMouseMove={handleMoveCursor}
                            onMouseLeave={() => {
                                setDragCursor(false);
                            }}
                        >
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                                className="diaporama-time"
                                style={{ left: `${(spentTime * 100) / getTotalDuration()}%` }}
                            ></div>
                            {mountingPlans ? (
                                <div className="diaporama-mounting-plans">
                                    {questions.map((question, index) => {
                                        const style =
                                            question === null || question.title == null || question.title.style === ''
                                                ? null
                                                : JSON.parse(question.title.style);
                                        if (question != null && question.title != null) time += question.title.duration;
                                        if (question != null && question.title != null) index++;
                                        return question == null ? null : (
                                            <>
                                                {question.title == null ? null : (
                                                    <div key={`title-${index}`} style={{ flex: question.title.duration }} data-index={index}>
                                                        <div className="mounting-item-title" data-duration={question.title.duration}>
                                                            <p
                                                                style={
                                                                    style === null
                                                                        ? {}
                                                                        : {
                                                                              fontFamily: style.fontFamily,
                                                                              left: `${style.left}%`,
                                                                              top: `${style.top}%`,
                                                                          }
                                                                }
                                                            >
                                                                {question.title.text}
                                                            </p>
                                                        </div>
                                                        {(question.plans || []).length > 0 ? (
                                                            <div
                                                                className="mounting-cursor"
                                                                onMouseDown={(e) => {
                                                                    e.stopPropagation();
                                                                    setDragCursor(true);
                                                                    setDragIndex(
                                                                        parseInt(
                                                                            (e.target as HTMLDivElement).parentElement?.getAttribute('data-index') ||
                                                                                '',
                                                                        ),
                                                                    );
                                                                }}
                                                                data-duration={`${getFormatedTime(time)}`}
                                                            ></div>
                                                        ) : null}
                                                    </div>
                                                )}
                                                {question.plans?.map((p, i) => {
                                                    time += p?.duration || 0;
                                                    index++;
                                                    return (
                                                        <div style={{ flex: p.duration || 0 }} key={`${index}-${i}`} data-index={index}>
                                                            <div
                                                                className="mounting-item-plan"
                                                                style={{ backgroundImage: `url('${p.url}')` }}
                                                                data-duration={p.duration}
                                                            ></div>
                                                            {i < (question.plans || []).length - 1 ? (
                                                                <div
                                                                    className="mounting-cursor"
                                                                    onMouseDown={(e) => {
                                                                        e.stopPropagation();
                                                                        setDragCursor(true);
                                                                        setDragIndex(
                                                                            parseInt(
                                                                                (e.target as HTMLDivElement).parentElement?.getAttribute(
                                                                                    'data-index',
                                                                                ) || '',
                                                                            ),
                                                                        );
                                                                    }}
                                                                    data-duration={`${getFormatedTime(time)}`}
                                                                ></div>
                                                            ) : null}
                                                        </div>
                                                    );
                                                })}
                                            </>
                                        );
                                    })}
                                </div>
                            ) : null}
                            {getCurrentSound().path == '' ? (
                                <div className="diaporama-mounting-sounds"></div>
                            ) : (
                                <div
                                    className="diaporama-mounting-sounds green"
                                    onMouseUp={() => {
                                        setDragSound(false);
                                    }}
                                    onMouseOut={() => {
                                        setDragSound(false);
                                    }}
                                    onMouseMove={moveAudio}
                                >
                                    <div
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            setDragSound(true);
                                            setStartDragSound(e.clientX - (mountingTableRef.current?.getBoundingClientRect()?.left || 0));
                                        }}
                                        className="diaporama-sound-file"
                                        style={{ width: `${getAudioDuration()}px`, left: `${getAudioPosition()}px` }}
                                    ></div>
                                </div>
                            )}
                        </div>
                        <div className="diaporama-volume">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={volume}
                                onChange={(e) => {
                                    const vol = parseInt(e.target.value);
                                    setVolume(vol);
                                    updateVolume(vol);
                                    if (audio != null) audio.volume = vol / 100;
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
