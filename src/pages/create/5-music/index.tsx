import { UploadIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/router';
import React from 'react';

import { useDeleteSoundMutation } from 'src/api/audios/audios.delete';
import { useCreateSoundMutation } from 'src/api/audios/audios.post';
import { useUpdateProjectMutation } from 'src/api/projects/projects.put';
import { useScenario } from 'src/api/scenarios/scenarios.get';
import { useTheme } from 'src/api/themes/themes.get';
import { DiaporamaPlayer } from 'src/components/create/DiaporamaPlayer';
import { Button } from 'src/components/layout/Button';
import { Container } from 'src/components/layout/Container';
import { Form } from 'src/components/layout/Form';
import { Title } from 'src/components/layout/Typography';
import { NextButton } from 'src/components/navigation/NextButton';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { Loader } from 'src/components/ui/Loader';
import { sendToast } from 'src/components/ui/Toasts';
import { useCollaboration } from 'src/hooks/useCollaboration';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { useSocket } from 'src/hooks/useSocket';
import { useTranslation } from 'src/i18n/useTranslation';
import { getSounds } from 'src/lib/get-sounds';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';
import { isString } from 'src/utils/type-guards/is-string';

const MusicPage = () => {
    const router = useRouter();
    const { t, currentLocale } = useTranslation();
    const { project, updateProject, questions, isLoading: isProjectLoading } = useCurrentProject();
    const { theme, isLoading: isThemeLoading } = useTheme(project ? project.themeId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });
    const { scenario } = useScenario(project ? project.scenarioId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });
    const { isCollaborationActive } = useCollaboration();
    const { socket, connectTeacher, updateProject: updateProjectSocket } = useSocket();

    const [soundBlob, setSoundBlob] = React.useState<Blob | null>(null);
    const [volume, setVolume] = React.useState<number>(project?.soundVolume ?? 100);
    const [soundBeginTime, setSoundBeginTime] = React.useState<number>(project?.musicBeginTime || 0);
    const soundUrl = React.useMemo(() => {
        if (soundBlob !== null) {
            return URL.createObjectURL(soundBlob);
        }
        return project?.soundUrl || '';
    }, [soundBlob, project]);
    const sounds = React.useMemo(() => getSounds(questions), [questions]);

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
                    musicBeginTime: Math.round(soundBeginTime),
                    soundUrl: newSoundUrl,
                    soundVolume: volume,
                });
            }

            // [4] update project.
            const updatedProject = updateProject({
                musicBeginTime: soundBeginTime,
                soundUrl: newSoundUrl,
                soundVolume: volume,
            });
            if (isCollaborationActive && updatedProject) {
                updateProjectSocket(updatedProject);
            }
            router.push(`/create/6-result${serializeToQueryUrl({ projectId: project.id || null })}`);
        } catch (err) {
            console.error(err);
            sendToast({ message: t('unknown_error'), type: 'error' });
        }
    };

    return (
        <Container>
            <ThemeBreadcrumbs theme={theme} isLoading={isThemeLoading}></ThemeBreadcrumbs>
            <Steps
                activeStep={4}
                themeId={project ? project.themeId : undefined}
                scenarioName={scenario?.names?.[currentLocale] || undefined}
            ></Steps>
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '2rem' }}>
                <Title color="primary" variant="h1" marginY="md">
                    <Inverted isRound>5</Inverted> {t('part5_title')}
                </Title>
                <Title color="inherit" variant="h2">
                    {t('part5_subtitle1')}
                </Title>

                <Form onSubmit={onSubmit} marginTop="lg">
                    <div style={{ marginBottom: '16px' }}>
                        {!isProjectLoading && (
                            <DiaporamaPlayer
                                canEdit
                                questions={questions}
                                soundUrl={soundUrl}
                                volume={volume}
                                setVolume={setVolume}
                                soundBeginTime={soundBeginTime}
                                setSoundBeginTime={setSoundBeginTime}
                                sounds={sounds}
                            />
                        )}
                    </div>

                    <div className="text-center">
                        <Button
                            label={t('import_music')}
                            variant="outlined"
                            color="secondary"
                            as="label"
                            isUpperCase={false}
                            role="button"
                            aria-controls="filename"
                            tabIndex={0}
                            onKeyPress={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    document.getElementById('sequence-sound-upload')?.click();
                                }
                            }}
                            htmlFor={'project-sound-upload'}
                            leftIcon={<UploadIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />}
                        ></Button>
                    </div>
                    <input id="project-sound-upload" type="file" accept="audio/*" onChange={onInputUpload} style={{ display: 'none' }} />

                    <NextButton type="submit" />
                </Form>
            </div>
            <Loader isLoading={isLoading} />
        </Container>
    );
};

export default MusicPage;
