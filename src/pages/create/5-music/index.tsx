import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React from 'react';

import CloudUploadIcon from '@mui/icons-material/Upload';
import { Typography, Button } from '@mui/material';

import { useDeleteSoundMutation } from 'src/api/audios/audios.delete';
import { useCreateSoundMutation } from 'src/api/audios/audios.post';
import { useUpdateProjectMutation } from 'src/api/projects/projects.put';
import { useScenario } from 'src/api/scenarios/scenarios.get';
import { useTheme } from 'src/api/themes/themes.get';
import { DiaporamaPlayer } from 'src/components/DiaporamaPlayer';
import { Loader } from 'src/components/layout/Loader';
import { NextButton } from 'src/components/navigation/NextButton';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { projectContext } from 'src/contexts/projectContext';
import { useTranslation } from 'src/i18n/useTranslation';
import { isString } from 'src/utils/type-guards/is-string';

const MusicPage = () => {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const { t, currentLocale } = useTranslation();
    const { project, updateProject, questions, isLoading: isProjectLoading } = React.useContext(projectContext);
    const { theme, isLoading: isThemeLoading } = useTheme(project ? project.themeId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });
    const { scenario } = useScenario(project ? project.scenarioId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });

    const [soundBlob, setSoundBlob] = React.useState<Blob | null>(null);
    const [volume, setVolume] = React.useState<number>(project?.soundVolume ?? 100);
    const [soundBeginTime, setSoundBeginTime] = React.useState<number>(project?.musicBeginTime || 0);
    const soundUrl = React.useMemo(() => {
        if (soundBlob !== null) {
            return URL.createObjectURL(soundBlob);
        }
        return project?.soundUrl || '';
    }, [soundBlob, project]);

    React.useEffect(() => {
        setVolume(project?.soundVolume ?? 100);
        setSoundBeginTime(project?.musicBeginTime || 0);
    }, [project]);

    const onInputUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files !== null && event.target.files.length > 0) {
            setSoundBlob(event.target.files[0]);
        }
        event.target.value = ''; // clear input
    };

    // --- Update project ---
    const deleteSoundMutation = useDeleteSoundMutation();
    const createSoundMutation = useCreateSoundMutation();
    const updateProjectMutation = useUpdateProjectMutation();
    const isLoading = deleteSoundMutation.isLoading || createSoundMutation.isLoading || updateProjectMutation.isLoading;

    const onSubmit = async () => {
        if (!project) {
            return;
        }

        // [1] delete previous sound if any.
        if (soundBlob !== null && project.soundUrl && isString(project.soundUrl) && project.soundUrl.startsWith('/api/sounds')) {
            try {
                await deleteSoundMutation.mutateAsync({ soundUrl: project.soundUrl });
            } catch (err) {
                // ignore delete error
                console.error(err);
            }
        }

        try {
            // [2] upload new sound if any.
            let newSoundUrl: string | null = project.soundUrl;
            if (soundBlob !== null) {
                const soundResponse = await createSoundMutation.mutateAsync({ sound: soundBlob });
                newSoundUrl = soundResponse.url;
            }

            // [3] update project data.
            if (project.id !== 0) {
                await updateProjectMutation.mutateAsync({
                    projectId: project.id,
                    musicBeginTime: soundBeginTime,
                    soundUrl: newSoundUrl,
                    soundVolume: volume,
                });
            }

            // [4] update project.
            updateProject({
                musicBeginTime: soundBeginTime,
                soundUrl: newSoundUrl,
                soundVolume: volume,
            });
            router.push('/create/6-result');
        } catch (err) {
            console.error(err);
            enqueueSnackbar(t('unknown_error'), {
                variant: 'error',
            });
        }
    };

    return (
        <div>
            <ThemeBreadcrumbs theme={theme} isLoading={isThemeLoading}></ThemeBreadcrumbs>
            <Steps
                activeStep={4}
                themeId={project ? project.themeId : undefined}
                scenarioName={scenario?.names?.[currentLocale] || undefined}
            ></Steps>
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '2rem' }}>
                <Typography color="primary" variant="h1">
                    <Inverted round>5</Inverted> {t('part5_title')}
                </Typography>
                <Typography color="inherit" variant="h2">
                    {t('part5_subtitle1')}
                </Typography>

                <div style={{ margin: '2rem 0' }}>
                    {!isProjectLoading && (
                        <DiaporamaPlayer
                            canEdit
                            questions={questions}
                            soundUrl={soundUrl}
                            volume={volume}
                            setVolume={setVolume}
                            soundBeginTime={soundBeginTime}
                            setSoundBeginTime={setSoundBeginTime}
                        />
                    )}
                </div>

                <div className="text-center">
                    <Button
                        variant="outlined"
                        color="secondary"
                        component="label"
                        htmlFor={'project-sound-upload'}
                        style={{ textTransform: 'none' }}
                        startIcon={<CloudUploadIcon />}
                    >
                        {t('import_music')}
                    </Button>
                </div>
                <input id="project-sound-upload" type="file" accept="audio/*" onChange={onInputUpload} style={{ display: 'none' }} />

                <NextButton onNext={onSubmit} />
            </div>
            <Loader isLoading={isLoading} />
        </div>
    );
};

export default MusicPage;
