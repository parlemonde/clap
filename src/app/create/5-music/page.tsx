'use client';

import { UploadIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { deleteSound } from 'src/actions/delete-sound';
import { uploadSound } from 'src/actions/upload-sound';
import { DiaporamaPlayer } from 'src/components/create/DiaporamaPlayer';
import { Button } from 'src/components/layout/Button';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import { NextButton } from 'src/components/navigation/NextButton';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { Loader } from 'src/components/ui/Loader';
import { sendToast } from 'src/components/ui/Toasts';
import { useTranslation } from 'src/contexts/translationContext';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { useDeepMemo } from 'src/hooks/useDeepMemo';
import { getSounds } from 'src/lib/get-sounds';

export default function MusicPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const { project, setProject } = useCurrentProject();
    const [isUploading, setIsUploading] = React.useState(false);

    const sounds = useDeepMemo(getSounds(project?.questions || []));

    if (!project) {
        return null;
    }

    const onInputUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files !== null && event.target.files.length > 0) {
            const file = event.target.files[0];
            setIsUploading(true);
            if (project.soundUrl) {
                try {
                    await deleteSound(project.soundUrl);
                } catch {
                    // Ignore error
                }
            }
            try {
                const soundUrl = await uploadSound(file);
                setProject({ ...project, soundUrl, soundBeginTime: 0 });
            } catch {
                sendToast({
                    message: t('error_upload_sound'),
                    type: 'error',
                });
            }
            setIsUploading(false);
        }
        event.target.value = ''; // clear input
    };

    return (
        <Container paddingBottom="xl">
            <ThemeBreadcrumbs themeId={project.themeId}></ThemeBreadcrumbs>
            <Steps activeStep={4} themeId={project.themeId}></Steps>
            <Title color="primary" variant="h1" marginY="md">
                <Inverted isRound>5</Inverted> {t('part5_title')}
            </Title>
            <Title color="inherit" variant="h2">
                {t('part5_subtitle1')}
            </Title>
            <div style={{ margin: '16px 0' }}>
                <DiaporamaPlayer
                    canEdit
                    questions={project.questions}
                    soundUrl={project.soundUrl || ''}
                    volume={project.soundVolume || 100}
                    setVolume={(newVolume) => {
                        setProject({ ...project, soundVolume: newVolume });
                    }}
                    soundBeginTime={project.soundBeginTime || 0}
                    setSoundBeginTime={(newSoundBeginTime) => {
                        setProject({ ...project, soundBeginTime: newSoundBeginTime });
                    }}
                    sounds={sounds}
                />
            </div>
            <div className="text-center">
                <label htmlFor="sequence-sound-upload" className="text-center" style={{ marginBottom: '10px' }}>
                    Format accepté: .acc, .ogg, .opus, .mp3, .wav, .m4a
                </label>
                <Button
                    label={t('import_music')}
                    variant="outlined"
                    color="secondary"
                    as="label"
                    isUpperCase={false}
                    role="button"
                    aria-controls="filename"
                    tabIndex={0}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            document.getElementById('sequence-sound-upload')?.click();
                        }
                    }}
                    htmlFor={'project-sound-upload'}
                    leftIcon={<UploadIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />}
                ></Button>
            </div>
            <input
                id="project-sound-upload"
                type="file"
                accept="audio/acc, audio/mpeg, audio/ogg, audio/opus, audio/wav, audio/x-wav, audio/x-m4a, audio/mp4"
                onChange={onInputUpload}
                style={{ display: 'none' }}
            />
            <Loader isLoading={isUploading} />
            <NextButton
                onNext={() => {
                    router.push('/create/6-result');
                }}
            />
        </Container>
    );
}
