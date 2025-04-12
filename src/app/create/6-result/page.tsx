'use client';

import { VideoIcon } from '@radix-ui/react-icons';
import * as React from 'react';

import { getMltZip } from 'src/actions/projects/generate-mlt-zip';
import { createVideoJob, getVideoJob } from 'src/actions/projects/generate-video';
import { DiaporamaPlayer } from 'src/components/create/DiaporamaPlayer';
import { Button } from 'src/components/layout/Button';
import { Container } from 'src/components/layout/Container';
import { Flex } from 'src/components/layout/Flex';
import { LinearProgress } from 'src/components/layout/LinearProgress';
import { Tooltip } from 'src/components/layout/Tooltip';
import { Title, Text } from 'src/components/layout/Typography';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { Loader } from 'src/components/ui/Loader';
import { sendToast } from 'src/components/ui/Toasts';
import { Trans } from 'src/components/ui/Trans';
import { useTranslation } from 'src/contexts/translationContext';
import { userContext } from 'src/contexts/userContext';
import { useCollaboration } from 'src/hooks/useCollaboration';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { useDeepMemo } from 'src/hooks/useDeepMemo';
import { getSounds } from 'src/lib/get-sounds';
import VideoFile from 'src/svg/plan.svg';

const styles: Record<'verticalLine' | 'horizontalLine', React.CSSProperties> = {
    verticalLine: {
        backgroundColor: '#79C3A5',
        flex: 1,
        width: '1px',
        margin: '4px 0',
    },
    horizontalLine: {
        backgroundColor: '#79C3A5',
        flex: 1,
        height: '1px',
        margin: '32px 16px',
    },
};

function LinearProgressWithLabel({ value }: { value: number }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '100%', marginRight: 16 }}>
                <LinearProgress value={value} color="secondary" />
            </div>
            <div style={{ minWidth: 35 }}>
                <Text className="color-secondary">{`${Math.round(value)}%`}</Text>
            </div>
        </div>
    );
}

const Or = () => {
    const { t } = useTranslation();
    return (
        <div className="or-horizontal-divider">
            <div style={styles.verticalLine} />
            <Text className="color-secondary">{t('or').toUpperCase()}</Text>
            <div style={styles.verticalLine} />
        </div>
    );
};

type VideoJob = {
    id: string;
    url?: string;
    progress: number;
    // projectId: number;
    // projectLastUpdateDate: string; // For validity
};

export default function ResultPage() {
    const { t } = useTranslation();
    const { user } = React.useContext(userContext);
    const { project, name } = useCurrentProject();
    useCollaboration(); // Listen to collaboration updates
    const sounds = useDeepMemo(getSounds(project?.questions || []));

    const [isLoading, setIsLoading] = React.useState(false);
    const [videoJob, setVideoJob] = React.useState<VideoJob | undefined>(undefined);

    // Automatically download the video when it's ready
    const willAutoDownload = React.useRef(false);
    const downloadVideoRef = React.useRef<HTMLAnchorElement | null>(null);
    React.useEffect(() => {
        if (videoJob?.url && willAutoDownload.current && downloadVideoRef.current) {
            willAutoDownload.current = false;
            downloadVideoRef.current.click();
        }
    }, [videoJob]);

    // Fetch video job status every second
    React.useEffect(() => {
        if (!videoJob || videoJob.progress === 100) {
            return;
        }
        const fetchVideoJob = async () => {
            const newJob = await getVideoJob(videoJob.id);
            if (newJob) {
                setVideoJob(newJob);
            } else {
                sendToast({
                    message: t('unknown_error'),
                    type: 'error',
                });
                setVideoJob(undefined);
            }
        };
        const timeout = setTimeout(fetchVideoJob, 1000);
        return () => {
            clearTimeout(timeout);
        };
    }, [t, videoJob]);

    if (!project || user?.role === 'student') {
        return null;
    }

    const generateMP4 = async () => {
        setIsLoading(true);
        const response = await createVideoJob(project, name || ''); // TODO generate name
        setIsLoading(false);
        if (response) {
            setVideoJob(response);
            if (response.progress !== 100) {
                willAutoDownload.current = true; // Will auto download when the video is ready
            }
        } else {
            sendToast({
                message: t('unknown_error'),
                type: 'error',
            });
        }
    };

    const generateMLT = async () => {
        if (!project) {
            return;
        }
        setIsLoading(true);
        const url = await getMltZip(project, name || ''); // TODO generate name
        setIsLoading(false);
        if (url) {
            const link = document.createElement('a');
            link.href = url;
            link.download = 'Montage.zip';
            link.click();
        }
    };

    return (
        <Container paddingBottom="xl">
            <ThemeBreadcrumbs themeId={project.themeId}></ThemeBreadcrumbs>
            <Steps activeStep={5} themeId={project.themeId}></Steps>
            <Title color="primary" variant="h1" marginY="md">
                <Inverted isRound>6</Inverted>
                <Trans i18nKey="part6_title">
                    À votre <Inverted>caméra</Inverted> !
                </Trans>
            </Title>
            <Title color="inherit" variant="h2">
                {t('part6_subtitle1')}
            </Title>
            <div style={{ margin: '16px 0' }}>
                <DiaporamaPlayer
                    questions={project.questions}
                    soundUrl={project.soundUrl || ''}
                    volume={project.soundVolume || 100}
                    setVolume={() => {}}
                    soundBeginTime={project.soundBeginTime || 0}
                    setSoundBeginTime={() => {}}
                    sounds={sounds}
                />
            </div>

            <Title variant="h2" style={{ margin: '16px 0' }}>
                {t('part6_subtitle2')}
            </Title>
            <Flex flexDirection="column" alignItems="center" marginX="auto" marginY="lg" style={{ maxWidth: '400px' }}>
                {videoJob?.url ? (
                    <Button
                        label={t('part6_mp4_download_button')}
                        as="a"
                        href={videoJob.url}
                        ref={downloadVideoRef}
                        className="full-width"
                        variant="contained"
                        color="secondary"
                        style={{ width: '100%' }}
                        leftIcon={<VideoIcon style={{ marginRight: '10px', width: '24px', height: '24px' }} />}
                        download
                    />
                ) : videoJob ? (
                    <div
                        style={{
                            width: '100%',
                            textAlign: 'center',
                            padding: '0.5rem 1rem',
                            border: '1px solid #79C3A5',
                            boxSizing: 'border-box',
                            borderRadius: 4,
                            boxShadow: '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)',
                        }}
                    >
                        <Text className="color-secondary" style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                            {t('part6_mp4_loading')}
                        </Text>
                        <LinearProgressWithLabel value={videoJob.progress} />
                    </div>
                ) : (
                    <Tooltip content={user === null ? t('part6_mp4_user_disabled') : ''} hasArrow>
                        <Button
                            label={t('part6_mp4_download_button')}
                            className="full-width"
                            variant="contained"
                            color="secondary"
                            onClick={generateMP4}
                            disabled={user === null}
                            style={{ width: '100%' }}
                            leftIcon={<VideoIcon style={{ marginRight: '10px', width: '24px', height: '24px' }} />}
                        ></Button>
                    </Tooltip>
                )}
                <Or />
                <Button
                    label={t('part6_mlt_button')}
                    leftIcon={<VideoFile style={{ marginRight: '10px' }} />}
                    className="full-width"
                    variant="contained"
                    color="secondary"
                    onClick={generateMLT}
                    style={{ width: '100%' }}
                ></Button>
            </Flex>
            <Loader isLoading={isLoading} />
        </Container>
    );
}
