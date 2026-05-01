'use client';

import { VideoIcon } from '@radix-ui/react-icons';
import * as React from 'react';

import { DiaporamaPlayer } from '@frontend/components/create/DiaporamaPlayer';
import { Button } from '@frontend/components/layout/Button';
import { Container } from '@frontend/components/layout/Container';
import { Flex } from '@frontend/components/layout/Flex';
import { LinearProgress } from '@frontend/components/layout/LinearProgress';
import { Modal } from '@frontend/components/layout/Modal';
import { Tooltip } from '@frontend/components/layout/Tooltip';
import { Title, Text } from '@frontend/components/layout/Typography';
import { Steps } from '@frontend/components/navigation/Steps';
import { ThemeBreadcrumbs } from '@frontend/components/navigation/ThemeBreadcrumbs';
import { Inverted } from '@frontend/components/ui/Inverted';
import { Loader } from '@frontend/components/ui/Loader';
import { sendToast } from '@frontend/components/ui/Toasts';
import { Trans } from '@frontend/components/ui/Trans';
import { useTranslation } from '@frontend/contexts/translationContext';
import { userContext } from '@frontend/contexts/userContext';
import { useCollaboration } from '@frontend/hooks/useCollaboration';
import { useCurrentProject } from '@frontend/hooks/useCurrentProject';
import { useDeepMemo } from '@frontend/hooks/useDeepMemo';
import { useLocalStorage } from '@frontend/hooks/useLocalStorage';
import {
    detectBrowserVideoSupport,
    isBrowserVideoCanceledError,
    isBrowserVideoDurationLimitError,
    renderProjectVideo,
    type BrowserVideoProgressStage,
    type BrowserVideoSupport,
} from '@frontend/lib/browser-video';
import VideoFile from '@frontend/svg/plan.svg';
import { getFormatedTime } from '@lib/get-formatted-time';
import { getSounds } from '@lib/get-sounds';
import { getMltZip } from '@server-actions/projects/generate-mlt-zip';
import { generateVideo, getVideoProgress } from '@server-actions/projects/generate-video';

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

type BrowserGenerationState =
    | {
          status: 'idle';
          percentage: number;
          stage: BrowserVideoProgressStage | null;
          url: string;
          extension: 'mp4' | 'webm' | null;
      }
    | {
          status: 'checking-support' | 'loading-assets' | 'rendering' | 'finalizing';
          percentage: number;
          stage: BrowserVideoProgressStage;
          url: string;
          extension: 'mp4' | 'webm' | null;
      }
    | {
          status: 'ready';
          percentage: number;
          stage: BrowserVideoProgressStage | null;
          url: string;
          extension: 'mp4' | 'webm';
      }
    | {
          status: 'failed' | 'canceled';
          percentage: number;
          stage: BrowserVideoProgressStage | null;
          url: string;
          extension: 'mp4' | 'webm' | null;
      };

const initialBrowserGenerationState: BrowserGenerationState = {
    status: 'idle',
    percentage: 0,
    stage: null,
    url: '',
    extension: null,
};

export default function ResultPage() {
    const { t } = useTranslation();
    const user = React.useContext(userContext);
    const [projectId] = useLocalStorage('projectId');
    const { projectData, name } = useCurrentProject();
    useCollaboration(); // Listen to collaboration updates
    const sounds = useDeepMemo(getSounds(projectData?.questions || []));

    const [isLoading, setIsLoading] = React.useState(false);
    const [videoProgress, setVideoProgress] = React.useState<{
        percentage: number;
        url: string;
    } | null>(null);
    const [browserSupport, setBrowserSupport] = React.useState<BrowserVideoSupport | null>(null);
    const [browserGeneration, setBrowserGeneration] = React.useState<BrowserGenerationState>(initialBrowserGenerationState);
    const browserGenerationAbortController = React.useRef<AbortController | null>(null);
    const downloadBrowserVideoRef = React.useRef<HTMLAnchorElement | null>(null);

    // Automatically download the video when it's ready
    const willAutoDownload = React.useRef(false);
    const downloadVideoRef = React.useRef<HTMLAnchorElement | null>(null);
    React.useEffect(() => {
        if (videoProgress?.url && willAutoDownload.current && downloadVideoRef.current) {
            willAutoDownload.current = false;
            downloadVideoRef.current.click();
        }
    }, [videoProgress]);
    React.useEffect(() => {
        detectBrowserVideoSupport()
            .then(setBrowserSupport)
            .catch(() => {
                setBrowserSupport({
                    supported: false,
                    reason: 'missing-codecs',
                });
            });
    }, []);
    React.useEffect(() => {
        return () => {
            browserGenerationAbortController.current?.abort();
        };
    }, []);
    React.useEffect(() => {
        const url = browserGeneration.url;
        return () => {
            if (url) {
                URL.revokeObjectURL(url);
            }
        };
    }, [browserGeneration.url]);
    React.useEffect(() => {
        if (browserGeneration.status === 'ready' && downloadBrowserVideoRef.current) {
            downloadBrowserVideoRef.current.click();
        }
    }, [browserGeneration.status]);

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

    const generateBrowserVideo = async () => {
        if (!projectData || browserSupport?.supported !== true) {
            return;
        }

        browserGenerationAbortController.current?.abort();
        const abortController = new AbortController();
        browserGenerationAbortController.current = abortController;
        setBrowserGeneration({
            status: 'checking-support',
            percentage: 0,
            stage: 'checking-support',
            url: '',
            extension: null,
        });

        try {
            const result = await renderProjectVideo(
                projectData,
                {
                    signal: abortController.signal,
                    support: browserSupport,
                },
                {
                    onProgress: ({ stage, percentage }) => {
                        if (browserGenerationAbortController.current !== abortController) {
                            return;
                        }
                        setBrowserGeneration({
                            status: stage,
                            percentage,
                            stage,
                            url: '',
                            extension: null,
                        });
                    },
                },
            );
            if (browserGenerationAbortController.current !== abortController) {
                return;
            }
            const url = URL.createObjectURL(result.blob);
            setBrowserGeneration({
                status: 'ready',
                percentage: 100,
                stage: null,
                url,
                extension: result.extension,
            });
        } catch (error) {
            if (browserGenerationAbortController.current !== abortController) {
                return;
            }
            setBrowserGeneration({
                status: isBrowserVideoCanceledError(error) ? 'canceled' : 'failed',
                percentage: 0,
                stage: null,
                url: '',
                extension: null,
            });
            if (!isBrowserVideoCanceledError(error)) {
                sendToast({
                    message: isBrowserVideoDurationLimitError(error)
                        ? t('6_result_page.download_browser_video_button.too_long', {
                              maxDuration: getFormatedTime(error.maxDurationMs),
                          })
                        : t('6_result_page.download_browser_video_button.failed'),
                    type: 'error',
                });
            }
        } finally {
            if (browserGenerationAbortController.current === abortController) {
                browserGenerationAbortController.current = null;
            }
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

    const isBrowserGenerationModalOpen =
        browserGeneration.status === 'checking-support' ||
        browserGeneration.status === 'loading-assets' ||
        browserGeneration.status === 'rendering' ||
        browserGeneration.status === 'finalizing';
    const browserGenerationStageLabel = browserGeneration.stage ? t(`6_result_page.download_browser_video_button.${browserGeneration.stage}`) : '';

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
                {browserGeneration.status === 'ready' && browserGeneration.url ? (
                    <Button
                        label={t('6_result_page.download_browser_video_button.download')}
                        as="a"
                        href={browserGeneration.url}
                        ref={downloadBrowserVideoRef}
                        className="full-width"
                        variant="contained"
                        color="secondary"
                        style={{ width: '100%' }}
                        leftIcon={<VideoIcon style={{ marginRight: '10px', width: '24px', height: '24px' }} />}
                        download={`video.${browserGeneration.extension}`}
                    />
                ) : (
                    <Tooltip
                        content={
                            browserSupport === null
                                ? t('6_result_page.download_browser_video_button.checking_support')
                                : browserSupport.supported
                                  ? ''
                                  : t(`6_result_page.download_browser_video_button.${browserSupport.reason}`)
                        }
                        hasArrow
                    >
                        <Button
                            label={t('6_result_page.download_browser_video_button.generate')}
                            className="full-width"
                            variant="contained"
                            color="secondary"
                            onClick={generateBrowserVideo}
                            disabled={browserSupport?.supported !== true}
                            style={{ width: '100%' }}
                            leftIcon={<VideoIcon style={{ marginRight: '10px', width: '24px', height: '24px' }} />}
                        ></Button>
                    </Tooltip>
                )}
                <Or />
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
            <Modal
                isOpen={isBrowserGenerationModalOpen}
                onClose={() => {}}
                title={t('6_result_page.download_browser_video_button.modal_title')}
                hasCloseButton={false}
                hasCancelButton={false}
                onOpenAutoFocus={false}
                width="md"
            >
                <Text className="color-secondary" style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                    {browserGenerationStageLabel}
                </Text>
                <LinearProgressWithLabel value={browserGeneration.percentage} />
                <Text marginTop="md" style={{ display: 'inline-block' }}>
                    {t('6_result_page.download_browser_video_button.keep_page_open')}
                </Text>
            </Modal>
            <Loader isLoading={isLoading} />
        </Container>
    );
}
