import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React from 'react';

import ChatIcon from '@mui/icons-material/Chat';
import TimerIcon from '@mui/icons-material/Timer';
import CloudUploadIcon from '@mui/icons-material/Upload';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { Typography, TextField, Button } from '@mui/material';

import { useDeleteSoundMutation } from 'src/api/audios/audios.delete';
import { useCreateSoundMutation } from 'src/api/audios/audios.post';
import { useUpdatePlanMutation } from 'src/api/plans/plans.put';
import { useUpdateQuestionMutation } from 'src/api/questions/questions.put';
import { useScenario } from 'src/api/scenarios/scenarios.get';
import { useTheme } from 'src/api/themes/themes.get';
import { DiaporamaPlayer } from 'src/components/DiaporamaPlayer';
import type { Sound } from 'src/lib/get-sounds';
import { Flex } from 'src/components/layout/Flex';
import { FlexItem } from 'src/components/layout/FlexItem';
import { Loader } from 'src/components/layout/Loader';
import { NextButton } from 'src/components/navigation/NextButton';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { projectContext } from 'src/contexts/projectContext';
import { useTranslation } from 'src/i18n/useTranslation';
import { isString } from 'src/utils/type-guards/is-string';
import { useQueryNumber } from 'src/utils/useQueryId';
import type { Question } from 'types/models/question.type';

const DEFAULT_SEQUENCE: Question = {
    id: 0,
    question: '',
    index: 0,
    projectId: 0,
    plans: [],
    title: null,
    voiceOff: null,
    voiceOffBeginTime: 0,
    soundUrl: null,
    soundVolume: 100,
};

const PreMountSequence = () => {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const { t, currentLocale } = useTranslation();
    const { project, questions, isLoading: isProjectLoading, updateProject } = React.useContext(projectContext);
    const { theme, isLoading: isThemeLoading } = useTheme(project ? project.themeId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });
    const { scenario } = useScenario(project ? project.scenarioId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });

    const questionIndex = useQueryNumber('question') ?? -1;
    const currentSequence = React.useMemo(() => (questionIndex !== -1 ? questions[questionIndex] : undefined), [questions, questionIndex]);
    const backUrl = '/create/4-pre-mounting';

    // --- new values ---
    const [sequence, setSequence] = React.useState<Question>(currentSequence || DEFAULT_SEQUENCE);
    const [voiceText, setVoiceText] = React.useState(currentSequence?.voiceOff || '');
    const [soundBlob, setSoundBlob] = React.useState<Blob | null>(null);
    const [volume, setVolume] = React.useState<number>(currentSequence?.soundVolume ?? 100);
    const [soundBeginTime, setSoundBeginTime] = React.useState<number>(currentSequence?.voiceOffBeginTime || 0);
    const soundUrl = React.useMemo(() => {
        if (soundBlob !== null) {
            return URL.createObjectURL(soundBlob);
        }
        return sequence.soundUrl || '';
    }, [soundBlob, sequence.soundUrl]);
    const sounds = React.useMemo<Sound[]>(() => [], []);

    // On external change, update the sequence.
    React.useEffect(() => {
        setSequence(currentSequence || DEFAULT_SEQUENCE);
        setVoiceText(currentSequence?.voiceOff || '');
        setVolume(currentSequence?.soundVolume ?? 100);
        setSoundBeginTime(currentSequence?.voiceOffBeginTime || 0);
    }, [currentSequence]);

    const onInputUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files !== null && event.target.files.length > 0) {
            setSoundBlob(event.target.files[0]);
        }
        event.target.value = ''; // clear input
    };

    // --- Update sequence and plans ---
    const deleteSoundMutation = useDeleteSoundMutation();
    const createSoundMutation = useCreateSoundMutation();
    const updatePlanMutation = useUpdatePlanMutation();
    const updateSequenceMutation = useUpdateQuestionMutation();
    const isLoading =
        deleteSoundMutation.isLoading || createSoundMutation.isLoading || updatePlanMutation.isLoading || updateSequenceMutation.isLoading;

    const onSubmit = async () => {
        if (!project || !currentSequence) {
            return;
        }

        // [1] delete previous sound if any.
        if (
            soundBlob !== null &&
            currentSequence.soundUrl &&
            isString(currentSequence.soundUrl) &&
            currentSequence.soundUrl.startsWith('/api/sounds')
        ) {
            try {
                await deleteSoundMutation.mutateAsync({ soundUrl: currentSequence.soundUrl });
            } catch (err) {
                // ignore delete error
                console.error(err);
            }
        }

        try {
            // [2] upload new sound if any.
            let newSoundUrl: string | null = currentSequence.soundUrl;
            if (soundBlob !== null) {
                const soundResponse = await createSoundMutation.mutateAsync({ sound: soundBlob });
                newSoundUrl = soundResponse.url;
            }

            // [3] update sequence data.
            if (project.id !== 0) {
                await updateSequenceMutation.mutateAsync({
                    questionId: currentSequence.id,
                    title: sequence.title ? { ...sequence.title, duration: Math.round(sequence.title.duration) } : null,
                    voiceOff: voiceText,
                    voiceOffBeginTime: Math.round(soundBeginTime),
                    soundUrl: newSoundUrl,
                    soundVolume: volume,
                });

                for (const plan of sequence.plans || []) {
                    if (plan.duration !== null) {
                        await updatePlanMutation.mutateAsync({
                            planId: plan.id,
                            duration: Math.round(plan.duration),
                        });
                    }
                }
            }

            // [4] update project.
            const newQuestions = [...questions];
            newQuestions[questionIndex] = {
                ...sequence,
                voiceOff: voiceText,
                voiceOffBeginTime: Math.round(soundBeginTime),
                soundUrl: newSoundUrl,
                soundVolume: volume,
            };
            updateProject({
                questions: newQuestions,
            });
            router.push(backUrl);
        } catch (err) {
            console.error(err);
            enqueueSnackbar(t('unknown_error'), {
                variant: 'error',
            });
        }
    };

    const diaporamaSequences = React.useMemo(() => (sequence ? [sequence] : []), [sequence]);

    return (
        <div>
            <ThemeBreadcrumbs theme={theme} isLoading={isThemeLoading}></ThemeBreadcrumbs>
            <Steps
                activeStep={3}
                themeId={project ? project.themeId : undefined}
                scenarioName={scenario?.names?.[currentLocale] || undefined}
                backHref={backUrl}
            ></Steps>
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '2rem' }}>
                <Typography color="primary" variant="h1">
                    <Inverted round>4</Inverted>
                    {t('pre_mount_title', { number: questionIndex + 1 })}
                </Typography>
                <Typography variant="h2">{t('pre_mount_title_desc')}</Typography>

                {/* Voice text */}
                <Flex isFullWidth flexDirection="row" alignItems="center" justifyContent="flex-start" style={{ marginTop: '1rem' }}>
                    <div className={`bolt ${voiceText ? 'green' : ''}`} style={{ marginRight: '10px' }}>
                        <ChatIcon sx={{ fontSize: '1.25rem', margin: '2px 0' }} />
                    </div>
                    <FlexItem flexGrow={1} flexBasis={0}>
                        <Typography color="inherit" variant="h2" style={{ margin: '1rem 0' }}>
                            {t('pre_mount_voice_off')}
                        </Typography>
                    </FlexItem>
                </Flex>
                <TextField
                    value={voiceText}
                    onChange={(event) => {
                        setVoiceText(event.target.value);
                    }}
                    required
                    multiline
                    placeholder={t('part4_plan_desc_placeholder')}
                    fullWidth
                    minRows={4}
                    variant="outlined"
                    color="secondary"
                    autoComplete="off"
                />

                {/* Durations */}
                <Flex isFullWidth flexDirection="row" alignItems="center" justifyContent="flex-start" style={{ marginTop: '2rem' }}>
                    <div className={`bolt green`} style={{ marginRight: '10px' }}>
                        <TimerIcon sx={{ fontSize: '1.25rem', margin: '2px 0' }} />
                    </div>
                    <FlexItem flexGrow={1} flexBasis={0}>
                        <Typography color="inherit" variant="h2" style={{ margin: '1rem 0' }}>
                            {t('pre_mount_duration')}
                        </Typography>
                    </FlexItem>
                </Flex>

                {diaporamaSequences.length > 0 && (
                    <DiaporamaPlayer
                        canEdit
                        canEditPlans
                        questions={diaporamaSequences}
                        setQuestion={setSequence}
                        soundUrl={soundUrl}
                        volume={volume}
                        setVolume={setVolume}
                        soundBeginTime={soundBeginTime}
                        setSoundBeginTime={setSoundBeginTime}
                        sounds={sounds}
                    />
                )}

                {/* Sound */}
                <Flex isFullWidth flexDirection="row" alignItems="center" justifyContent="flex-start" style={{ marginTop: '2rem' }}>
                    <div className={`bolt ${soundUrl ? 'green' : ''}`} style={{ marginRight: '10px' }}>
                        <VolumeUpIcon sx={{ fontSize: '1.25rem', margin: '2px 0' }} />
                    </div>
                    <FlexItem flexGrow={1} flexBasis={0}>
                        <Typography color="inherit" variant="h2" style={{ margin: '1rem 0' }}>
                            {t('pre_mount_no_sound')}
                        </Typography>
                    </FlexItem>
                </Flex>
                <div className="text-center">
                    <Button
                        variant="outlined"
                        color="secondary"
                        component="label"
                        htmlFor={'sequence-sound-upload'}
                        style={{ textTransform: 'none' }}
                        startIcon={<CloudUploadIcon />}
                    >
                        {t('import_voice_off')}
                    </Button>
                </div>
                <input id="sequence-sound-upload" type="file" accept="audio/*" onChange={onInputUpload} style={{ display: 'none' }} />

                <NextButton backHref={backUrl} label={t('continue')} onNext={onSubmit} />
            </div>
            <Loader isLoading={isLoading} />
        </div>
    );
};

export default PreMountSequence;
