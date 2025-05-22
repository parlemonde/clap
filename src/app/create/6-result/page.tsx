'use client';

import { VideoIcon } from '@radix-ui/react-icons';
import * as React from 'react';

import { getMltZip } from 'src/actions/projects/generate-mlt-zip';
import { generateVideo, getVideoProgress } from 'src/actions/projects/generate-video';
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
import { useLocalStorage } from 'src/hooks/useLocalStorage';
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
            <Text className="color-secondary">{t('common.actions.or').toUpperCase()}</Text>
            <div style={styles.verticalLine} />
        </div>
    );
};

export default function ResultPage() {
    const { t } = useTranslation();
    const { user } = React.useContext(userContext);
    const [projectId] = useLocalStorage('projectId');
    const { projectData, name } = useCurrentProject();
    useCollaboration(); // Listen to collaboration updates
    const sounds = useDeepMemo(getSounds(projectData?.questions || []));

    const [isLoading, setIsLoading] = React.useState(false);
    const [videoProgress, setVideoProgress] = React.useState<{
        percentage: number;
        url: string;
    } | null>(null);

    // Automatically download the video when it's ready
    const willAutoDownload = React.useRef(false);
    const downloadVideoRef = React.useRef<HTMLAnchorElement | null>(null);
    React.useEffect(() => {
        if (videoProgress?.url && willAutoDownload.current && downloadVideoRef.current) {
            willAutoDownload.current = false;
            downloadVideoRef.current.click();
        }
    }, [videoProgress]);

    // Fetch video job status every second
    React.useEffect(() => {
        if (!videoProgress || videoProgress.percentage === 100) {
            return;
        }
        const fetchVideoProgress = async () => {
            const newProgress = await getVideoProgress(projectId);
            setVideoProgress(newProgress);
            if (newProgress === null) {
                sendToast({
                    message: t('common.errors.unknown'),
                    type: 'error',
                });
            }
        };
        const timeout = setTimeout(fetchVideoProgress, 1000);
        return () => {
            clearTimeout(timeout);
        };
    }, [t, videoProgress, projectId]);

    if (!projectData || user?.role === 'student') {
        return null;
    }

    const generateMP4 = async () => {
        if (!user || !projectId) {
            return;
        }
        setIsLoading(true);
        const response = await generateVideo(projectData, name || 'video', projectId);
        setIsLoading(false);
        if (response) {
            setVideoProgress(response);
            if (response.percentage !== 100) {
                willAutoDownload.current = true; // Will auto download when the video is ready
            }
            if (response.percentage === 100 && response.url) {
                const link = document.createElement('a');
                link.href = response.url;
                link.download = 'video.mp4';
                link.click();
            }
        } else {
            sendToast({
                message: t('common.errors.unknown'),
                type: 'error',
            });
        }
    };

    const generateMLT = async () => {
        if (!projectData) {
            return;
        }
        setIsLoading(true);
        const url = await getMltZip(projectData, name || 'video');
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
            <ThemeBreadcrumbs themeId={projectData.themeId}></ThemeBreadcrumbs>
            <Steps activeStep={5} themeId={projectData.themeId}></Steps>
            <Title color="primary" variant="h1" marginY="md">
                <Inverted isRound>6</Inverted>
                <Trans i18nKey="6_result_page.header.title">
                    À votre <Inverted>caméra</Inverted> !
                </Trans>
            </Title>
            <Title color="inherit" variant="h2">
                {t('6_result_page.secondary.title')}
            </Title>
            <div style={{ margin: '16px 0' }}>
                <DiaporamaPlayer
                    questions={projectData.questions}
                    soundUrl={projectData.soundUrl || ''}
                    volume={projectData.soundVolume || 100}
                    setVolume={() => {}}
                    soundBeginTime={projectData.soundBeginTime || 0}
                    setSoundBeginTime={() => {}}
                    sounds={sounds}
                />
            </div>

            <Title variant="h2" style={{ margin: '16px 0' }}>
                {t('6_result_page.downloads_buttons.title')}
            </Title>
            <Flex flexDirection="column" alignItems="center" marginX="auto" marginY="lg" style={{ maxWidth: '400px' }}>
                {videoProgress?.url ? (
                    <Button
                        label={t('6_result_page.download_mp4_button.label')}
                        as="a"
                        href={videoProgress.url}
                        ref={downloadVideoRef}
                        className="full-width"
                        variant="contained"
                        color="secondary"
                        style={{ width: '100%' }}
                        leftIcon={<VideoIcon style={{ marginRight: '10px', width: '24px', height: '24px' }} />}
                        download
                    />
                ) : videoProgress ? (
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
                            {t('6_result_page.download_mp4_button.loading')}
                        </Text>
                        <LinearProgressWithLabel value={videoProgress.percentage} />
                    </div>
                ) : (
                    <Tooltip
                        content={
                            user === undefined
                                ? t('6_result_page.download_mp4_button.user_disabled')
                                : !projectId
                                  ? t('6_result_page.download_mp4_button.project_disabled')
                                  : ''
                        }
                        hasArrow
                    >
                        <Button
                            label={t('6_result_page.download_mp4_button.generate')}
                            className="full-width"
                            variant="contained"
                            color="secondary"
                            onClick={generateMP4}
                            disabled={user === undefined || !projectId}
                            style={{ width: '100%' }}
                            leftIcon={<VideoIcon style={{ marginRight: '10px', width: '24px', height: '24px' }} />}
                        ></Button>
                    </Tooltip>
                )}
                <Or />
                <Button
                    label={t('6_result_page.download_mlt_button.label')}
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
