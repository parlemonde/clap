import { useRouter } from 'next/router';
import React from 'react';

import MoveIcon from '@mui/icons-material/DragIndicator';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { Inverted } from 'src/components/Inverted';
import { Steps } from 'src/components/create/Steps';
import { ThemeLink } from 'src/components/create/ThemeLink';
import { useTranslation } from 'src/i18n/useTranslation';
import { usePlanRequests } from 'src/services/usePlans';
import { ProjectServiceContext } from 'src/services/useProject';
import { getQuestions, getQueryString } from 'src/util';
import type { Question } from 'types/models/question.type';

const PlanTitle: React.FunctionComponent = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const { project, updateProject } = React.useContext(ProjectServiceContext);
    const { updateTitle } = usePlanRequests();

    const questions = getQuestions(project);
    const questionIndex = parseInt(getQueryString(router.query.question) || '-1', 10);
    const question = questionIndex !== -1 ? questions[questionIndex] || null : null;

    const [fontFamily, setFontFamily] = React.useState<string>('serif');
    const [coordinates, setCoordinates] = React.useState<{ x: number; y: number }>({ x: 10, y: 35 });
    const [text, setText] = React.useState<string>('');
    const [isDragging, setIsDragging] = React.useState<boolean>(false);
    const [initialized, setInitialized] = React.useState<boolean>(false);
    const titleRef = React.useRef<HTMLDivElement | null>(null);
    const textRef = React.useRef<HTMLTextAreaElement | null>(null);
    const selectRef = React.useRef<HTMLSelectElement | null>(null);

    React.useLayoutEffect(() => {
        if (question !== null && !initialized) {
            const title = question.title;
            if (title) {
                setText(title.text);
                if (textRef.current) {
                    textRef.current.value = title.text;
                }
                const style = title.style === '' ? null : JSON.parse(title.style);
                if (style !== null) {
                    setCoordinates({ x: style.left, y: style.top });
                    setFontFamily(style.fontFamily);
                    if (selectRef.current) {
                        selectRef.current.value = style.fontFamily;
                    }
                }
            }
            setInitialized(true);
        }
    }, [question, initialized, textRef, selectRef, coordinates, fontFamily, text]);

    const handleBack = (event: React.MouseEvent) => {
        event.preventDefault();
        router.push(`/create/3-storyboard-and-filming-schedule`);
    };

    const updateQuestion = (index: number, newQuestion: Partial<Question>) => {
        const questions = project.questions || [];
        const prevQuestion = questions[index];
        questions[index] = { ...prevQuestion, ...newQuestion };
        updateProject({ questions });
    };

    const handleConfirm = async (event: React.MouseEvent) => {
        event.preventDefault();
        if (question !== null && question.title) {
            question.title.text = text;
            question.title.style = JSON.stringify({
                fontFamily,
                left: coordinates.x,
                top: coordinates.y,
            });
            updateQuestion(questionIndex, question);
        }
        updateQuestion(questionIndex, question);
        if (question !== null && question.id !== null && question.id !== -1) {
            await updateTitle(question.title);
        }
        router.push(`/create/3-storyboard-and-filming-schedule`);
    };

    return (
        <div>
            <ThemeLink />
            <Steps activeStep={2} />
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '2rem' }}>
                <Typography color="primary" variant="h1">
                    <Inverted round>3</Inverted> {t('edit_plan_title')} {(question?.index || 0) + 1}
                </Typography>
                <Typography variant="h2">
                    <span>{t('part3_question')}</span> {question?.question}
                </Typography>
                <Typography>
                    <span>{t('edit_plan_title_desc')}</span>
                </Typography>

                <div
                    className="titleEditor"
                    ref={titleRef}
                    onMouseMove={(e) => {
                        if (!isDragging || !titleRef.current) return;
                        const parentPos = titleRef.current.getBoundingClientRect();
                        const parentWidth = titleRef.current.offsetWidth;
                        const parentHeight = titleRef.current.offsetHeight;
                        const mousePos = { x: e.clientX, y: e.clientY };
                        let left = ((mousePos.x - parentPos.x) * 100) / parentWidth;
                        let top = ((mousePos.y - parentPos.y) * 100) / parentHeight;
                        if (left < 0) left = 0;
                        if (top < 6) top = 6;
                        setCoordinates({ x: left, y: top });
                    }}
                    onMouseUp={() => {
                        setIsDragging(false);
                    }}
                    onMouseLeave={() => {
                        setIsDragging(false);
                    }}
                >
                    <div className="title" style={{ left: `calc(${coordinates.x}% - 20px)`, top: `calc(${coordinates.y}% + 20px)` }}>
                        <div className="toolbar">
                            <button
                                onMouseDown={() => {
                                    setIsDragging(true);
                                }}
                            >
                                <MoveIcon />
                            </button>
                            <select onChange={(e) => setFontFamily(e.target.value)} ref={selectRef}>
                                <option value="serif">Serif</option>
                                <option value="sans-serif">Sans-serif</option>
                            </select>
                        </div>
                        <textarea
                            onBlur={(e) => setText(e.target.value)}
                            ref={textRef}
                            style={{ fontFamily }}
                            placeholder="Ajouter un titre"
                        ></textarea>
                    </div>
                </div>

                <div style={{ width: '100%', textAlign: 'right', margin: '2rem 0' }}>
                    <Button
                        component="a"
                        variant="outlined"
                        color="secondary"
                        style={{ marginRight: '1rem' }}
                        href="/create/3-storyboard-and-filming-schedule"
                        onClick={handleBack}
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        component="a"
                        variant="contained"
                        color="secondary"
                        style={{ marginRight: '1rem' }}
                        href={`/create/3-storyboard-and-filming-schedule/edit?question=${questionIndex}`}
                        onClick={handleConfirm}
                    >
                        {t('save')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PlanTitle;
