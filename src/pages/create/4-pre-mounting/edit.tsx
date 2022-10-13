import { useRouter } from 'next/router';
import React from 'react';

import TimeIcon from '@mui/icons-material/Alarm';
import VoiceOffIcon from '@mui/icons-material/Chat';
import CloudUploadIcon from '@mui/icons-material/Upload';
import VoiceOffSoundIcon from '@mui/icons-material/VolumeUp';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Inverted } from 'src/components/Inverted';
import { DiaporamaPlayer } from 'src/components/create/DiaporamaPlayer';
import { Steps } from 'src/components/create/Steps';
import { ThemeLink } from 'src/components/create/ThemeLink';
import { useTranslation } from 'src/i18n/useTranslation';
import { ProjectServiceContext } from 'src/services/useProject';
import { useQuestionRequests } from 'src/services/useQuestions';
import { useSoundRequests } from 'src/services/useSound';
import { getQuestions, getQueryString } from 'src/util';
import type { Question } from 'types/models/question.type';

const PlanTitle: React.FunctionComponent = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const { project, updateProject } = React.useContext(ProjectServiceContext);
    const { uploadQuestionSound, editQuestion } = useQuestionRequests();
    const { editSound } = useSoundRequests();
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    const questions = getQuestions(project);
    const questionIndex = parseInt(getQueryString(router.query.question) || '-1', 10);
    const question = questionIndex !== -1 ? questions[questionIndex] || null : null;

    const handleBack = (event: React.MouseEvent) => {
        event.preventDefault();
        router.push(`/create/4-pre-mounting`);
    };

    const updateQuestion = (index: number, newQuestion: Partial<Question>) => {
        const questions = project.questions || [];
        const prevQuestion = questions[index];
        questions[index] = { ...prevQuestion, ...newQuestion };
        updateProject({ questions });
    };

    const handleVoiceOffChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (question === null) return;
        question.voiceOff = (event.target.value || '').slice(0, 2000);
        updateQuestion(questionIndex, question);
    };
    const handleVoiceOffBlur = async () => {
        if (question === null) return;
        updateQuestion(questionIndex, question);
    };

    const handleConfirm = async (event: React.MouseEvent) => {
        event.preventDefault();
        if (question !== null) {
            updateQuestion(questionIndex, question);
            if (question.id != null && question.id != -1) {
                await editQuestion(question);
            }
            if (question.sound != null) {
                await editSound(question.sound);
            }
        }
        router.push(`/create/4-pre-mounting`);
    };

    const uploadSound = async (url: string) => {
        const blobSound = await fetch(url).then((r) => r.blob());
        await uploadQuestionSound(blobSound, questionIndex);
    };

    const handleInputchange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files !== null && event.target.files.length > 0) {
            const url = URL.createObjectURL(event.target.files[0]);
            uploadSound(url);
        }
    };

    return (
        <div>
            <ThemeLink />
            <Steps activeStep={3} />
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '2rem' }}>
                <Typography color="primary" variant="h1">
                    <Inverted round>4</Inverted> {t('pre_mount_title')} {(question?.index || 0) + 1}
                </Typography>
                <Typography>
                    <span>{t('pre_mount_title_desc')}</span>
                </Typography>
                <div style={{ marginTop: '20px', display: 'flex' }}>
                    <div className={`voice-off-icon ${question?.voiceOff == '' ? '' : 'green'}`}>
                        <VoiceOffIcon />
                    </div>
                    <span>{t('pre_mount_voice_off')}</span>
                </div>
                <div>
                    <TextField
                        value={question?.voiceOff}
                        onChange={handleVoiceOffChange}
                        onBlur={handleVoiceOffBlur}
                        required
                        multiline
                        placeholder={t('part4_plan_desc_placeholder')}
                        fullWidth
                        style={{ marginTop: '0.5rem' }}
                        variant="outlined"
                        color="secondary"
                        autoComplete="off"
                    />
                </div>
                <div style={{ marginTop: '20px', display: 'flex' }}>
                    <div className="time-icon">
                        <TimeIcon />
                    </div>
                    <span>{t('pre_mount_duration')}</span>
                </div>
                <div>
                    <DiaporamaPlayer questions={question ? [question] : []} mountingPlans={true} questionIndex={questionIndex} videoOnly={false} />
                </div>
                <div style={{ margin: '50px 0 20px', display: 'flex' }}>
                    <div className={`voice-off-icon ${question?.sound == null ? '' : 'green'}`}>
                        <VoiceOffSoundIcon />
                    </div>
                    <span>{question?.sound == null ? t('pre_mount_no_sound') : t('pre_mount_sound')}</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <input
                        id="plan-img-upload"
                        type="file"
                        accept="audio/mp3"
                        onChange={handleInputchange}
                        ref={inputRef}
                        style={{ display: 'none' }}
                    />
                    <Button
                        variant="outlined"
                        color="secondary"
                        component="label"
                        htmlFor="plan-img-upload"
                        style={{ textTransform: 'none' }}
                        startIcon={<CloudUploadIcon />}
                    >
                        {t('import_voice_off')}
                    </Button>
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
