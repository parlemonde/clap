import React from 'react';

import Camera from '@mui/icons-material/CameraAlt';
import PlayArrow from '@mui/icons-material/PlayArrow';
import Sound from '@mui/icons-material/VolumeUp';

import { ProjectServiceContext } from 'src/services/useProject';
import type { Plan } from 'types/models/plan.type';
import type { Question } from 'types/models/question.type';
import type { Title } from 'types/models/title.type';

interface DiaporamaPlayerProps {
    questions: Question[];
    mountingPlans: boolean;
}

export const DiaporamaPlayer: React.FunctionComponent<DiaporamaPlayerProps> = ({ questions, mountingPlans }: DiaporamaPlayerProps) => {
    const { updateProject, project } = React.useContext(ProjectServiceContext);
    const diaporamaRef = React.useRef(null);
    const mountingTableRef = React.useRef(null);
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
            } else if (audio != null) {
                audio.pause();
            }
        },
        [audio, getBeginTime, getCurrentSound, spentTime],
    );

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
                if (plan !== currentId) {
                    current.style.display = 'none';
                    setCurrentId(plan);
                }
            }
        }, 10);
        return () => clearInterval(interval);
    }, [diaporamaRef, currentId, spentTime, isPlaying, audio, getBeginTime, getTotalDuration, setIsPlaying]);

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
        questions.map((q) => {
            if (q.title != null) {
                i++;
                if (i == dragIndex) elem = q.title;
                else if (elem === null) timeBefore += q.title.duration;
                if (i > dragIndex) nbElemAfter++;
            }
            if (q.plans == null) return;
            q.plans.map((p) => {
                i++;
                if (i == dragIndex) elem = p;
                else if (elem === null && p.duration != null) timeBefore += p.duration;
                if (i > dragIndex) nbElemAfter++;
            });
        });
        if (elem == null) return;
        time -= timeBefore; // Get the new duration of the plan
        const diff = Math.floor(time - elem.duration); // Calculate the diff between before and after moving
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
                if (j > dragIndex && p.duration - toAdd < getTotalDuration()) p.duration -= toAdd;
            });
        });
        updateProject({ questions });
    };

    const getAudioDuration = () => {
        if (audio == null || mountingTableRef.current == null) return 0;
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
        if (mountingPlans) {
            questions[0].voiceOffBeginTime += time;
        } else {
            project.musicBeginTime += time;
        }
        setStartDragSound(x);
        updateProject({ questions });
        if (audio != null) audio.currentTime = (spentTime - getBeginTime()) / 1000;
    };

    const addTotalTime = (qte: number) => {
        if (questions[0].duration + qte <= 0 || questions[0] == null) return;
        questions[0].duration += qte;
        const c = 2;
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
        updateProject({ questions });
    };

    return (
        <div className="diaporama-player-container">
            <div className="diaporama-player">
                <div
                    className="diaporama-play-btn"
                    onClick={() => {
                        setIsPlaying(!isPlaying);
                    }}
                >
                    {isPlaying ? null : (
                        <div className="square-btn">
                            <PlayArrow />
                        </div>
                    )}
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
                            <p className="diaporama-total-duration">{getFormatedTime(getTotalDuration())}</p>
                            <button onClick={() => addTotalTime(1000)}>+</button>
                        </div>
                    ) : (
                        <p>{getTotalDuration()}</p>
                    )}
                </div>
                <div>
                    <div className="diaporama-icons">
                        <Camera />
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
                                                                style === {}
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
                                                    {question.plans?.length > 0 ? (
                                                        <div
                                                            className="mounting-cursor"
                                                            onMouseDown={(e) => {
                                                                e.stopPropagation();
                                                                setDragCursor(true);
                                                                setDragIndex(parseInt(e.target.parentElement.getAttribute('data-index')));
                                                            }}
                                                            data-duration={`${getFormatedTime(time)}`}
                                                        ></div>
                                                    ) : null}
                                                </div>
                                            )}
                                            {question.plans?.map((p, i) => {
                                                time += p.duration;
                                                index++;
                                                return (
                                                    <div style={{ flex: p.duration }} key={`${index}-${i}`} data-index={index}>
                                                        <div
                                                            className="mounting-item-plan"
                                                            style={{ backgroundImage: `url('${p.url}')` }}
                                                            data-duration={p.duration}
                                                        ></div>
                                                        {i < question.plans?.length - 1 ? (
                                                            <div
                                                                className="mounting-cursor"
                                                                onMouseDown={(e) => {
                                                                    e.stopPropagation();
                                                                    setDragCursor(true);
                                                                    setDragIndex(parseInt(e.target.parentElement.getAttribute('data-index')));
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
                                        setStartDragSound(e.clientX - mountingTableRef.current.getBoundingClientRect().left);
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
                                if (audio != null) audio.volume = vol / 100;
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
