import { useRouter } from 'next/router';
import React from 'react';

import TimeIcon from '@mui/icons-material/Alarm';
import VoiceOffIcon from '@mui/icons-material/Chat';
import VoiceOffSoundIcon from '@mui/icons-material/VolumeUp';
import ButtonBase from '@mui/material/ButtonBase';

import { ProjectServiceContext } from 'src/services/useProject';
import { getQuestions } from 'src/util';

interface SequenceDiaporamaProps {
    questionIndex: number;
}

export const SequenceDiaporama: React.FunctionComponent<SequenceDiaporamaProps> = ({ questionIndex }: SequenceDiaporamaProps) => {
    const { project, updateProject } = React.useContext(ProjectServiceContext);
    const questions = getQuestions(project);
    const question = questionIndex !== -1 ? questions[questionIndex] || null : null;
    const style = question === null || question.title == null || question.title.style === '' ? null : JSON.parse(question.title.style);

    const updateQuestion = (index: number, newQuestion: Partial<Question>) => {
        const questions = project.questions || [];
        const prevQuestion = questions[index];
        questions[index] = { ...prevQuestion, ...newQuestion };
        updateProject({ questions });
    };

    if (question?.duration == null) {
        question?.duration = question?.plans?.length * 3000;
        if (question.title != null) question?.duration += 3000;
        updateQuestion(questionIndex, question);
    }

    const diaporamaRef = React.useRef(null);
    const [currentId, setCurrentId] = React.useState(0);

    React.useEffect(() => {
        let totalDuration = 0;

        const interval = setInterval(() => {
            totalDuration += 100;
            const current = diaporamaRef.current.children[currentId];
            current.style.display = 'block';
            if (current.getAttribute('data-duration') <= totalDuration) {
                totalDuration = 0;
                current.style.display = 'none';
                setCurrentId(currentId === diaporamaRef.current.children.length - 1 ? 0 : currentId + 1);
            }
        }, 100);
        return () => clearInterval(interval);
    }, [diaporamaRef, currentId]);

    return (
        <div>
            <ButtonBase className="sequence-diaporama" component="a" href={`/create/4-pre-mounting/edit?question=${questionIndex}`}>
                <div className="sequence-plans" ref={diaporamaRef}>
                    {question.title == null ? null : (
                        <div
                            className="sequence-title"
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
                                className="sequence-plan"
                                style={{ backgroundImage: `url('${p.url}')` }}
                                data-duration={p.duration}
                            ></div>
                        );
                    })}
                </div>
                <div className="diaporama-indicators">
                    <div>
                        <div className={`voiceOff ${question?.voiceOff == null ? '' : 'active'}`}>
                            <VoiceOffIcon />
                        </div>
                        <div className="voiceOff">
                            <VoiceOffSoundIcon />
                        </div>
                    </div>
                    <div className="time">
                        <TimeIcon />
                        {question?.duration / 1000} s
                    </div>
                </div>
            </ButtonBase>
        </div>
    );
};
