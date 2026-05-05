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

type FilePickerAcceptType = {
    description: string;
    accept: Record<string, string[]>;
};

type FileSystemFileHandle = {
    createWritable: () => Promise<WritableStream>;
};

type WindowWithFileSystemAccess = Window &
    typeof globalThis & {
        showSaveFilePicker?: (options?: { suggestedName?: string; types?: FilePickerAcceptType[] }) => Promise<FileSystemFileHandle>;
    };

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
          url: string | null;
          extension: 'mp4' | 'webm';
          outputKind: 'blob' | 'file';
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

const getCanStreamVideoToFile = () => {
    if (typeof window === 'undefined') {
        return false;
    }
    const fileSystemWindow = window as WindowWithFileSystemAccess;
    return window.isSecureContext && typeof fileSystemWindow.showSaveFilePicker === 'function';
};

const isFilePickerAbortError = (error: unknown) => {
    return error instanceof DOMException && error.name === 'AbortError';
};

export default function ResultPage() {
    const { t } = useTranslation();
    const user = React.useContext(userContext);
    const { projectData, name } = useCurrentProject();
    useCollaboration(); // Listen to collaboration updates
    const sounds = useDeepMemo(getSounds(projectData?.questions || []));

    const [isLoading, setIsLoading] = React.useState(false);
    const [browserSupport, setBrowserSupport] = React.useState<BrowserVideoSupport | null>(null);
    const [browserGeneration, setBrowserGeneration] = React.useState<BrowserGenerationState>(initialBrowserGenerationState);
    const browserGenerationAbortController = React.useRef<AbortController | null>(null);
    const downloadBrowserVideoRef = React.useRef<HTMLAnchorElement | null>(null);
    const canStreamVideoToFile = React.useMemo(() => getCanStreamVideoToFile(), []);

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

    if (!projectData || user?.role === 'student') {
        return null;
    }

    const generateBrowserVideo = async () => {
        if (!projectData || browserSupport?.supported !== true) {
            return;
        }

        browserGenerationAbortController.current?.abort();
        let writable: WritableStream | null = null;
        if (canStreamVideoToFile) {
            try {
                const fileSystemWindow = window as WindowWithFileSystemAccess;
                const handle = await fileSystemWindow.showSaveFilePicker?.({
                    suggestedName: `video.${browserSupport.extension}`,
                    types: [
                        {
                            description: browserSupport.extension === 'mp4' ? 'MP4 video' : 'WebM video',
                            accept: {
                                [browserSupport.mimeType]: [`.${browserSupport.extension}`],
                            },
                        },
                    ],
                });
                if (!handle) {
                    return;
                }
                writable = await handle.createWritable();
            } catch (error) {
                if (isFilePickerAbortError(error)) {
                    return;
                }
                sendToast({
                    message: t('6_result_page.download_video_button.failed'),
                    type: 'error',
                });
                return;
            }
        }

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
                    target: writable
                        ? {
                              kind: 'stream',
                              writable,
                          }
                        : {
                              kind: 'buffer',
                          },
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
            if (result.kind === 'blob') {
                const url = URL.createObjectURL(result.blob);
                setBrowserGeneration({
                    status: 'ready',
                    percentage: 100,
                    stage: null,
                    url,
                    extension: result.extension,
                    outputKind: 'blob',
                });
            } else {
                setBrowserGeneration({
                    status: 'ready',
                    percentage: 100,
                    stage: null,
                    url: null,
                    extension: result.extension,
                    outputKind: 'file',
                });
                sendToast({
                    message: t('6_result_page.download_video_button.saved'),
                    type: 'success',
                });
            }
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
                        ? t('6_result_page.download_video_button.too_long', {
                              maxDuration: getFormatedTime(error.maxDurationMs),
                          })
                        : t('6_result_page.download_video_button.failed'),
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
    const browserGenerationStageLabel = browserGeneration.stage ? t(`6_result_page.download_video_button.${browserGeneration.stage}`) : '';

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
                <Tooltip
                    content={
                        browserSupport === null
                            ? t('6_result_page.download_video_button.checking_support')
                            : browserSupport.supported
                              ? ''
                              : t(`6_result_page.download_video_button.${browserSupport.reason}`)
                    }
                    hasArrow
                >
                    {browserGeneration.status === 'ready' && browserGeneration.url ? (
                        <Button
                            label={t('6_result_page.download_video_button.download')}
                            as="a"
                            href={browserGeneration.url}
                            ref={downloadBrowserVideoRef}
                            download={`video.${browserGeneration.extension}`}
                            className="full-width"
                            variant="contained"
                            color="secondary"
                            style={{ width: '100%' }}
                            leftIcon={<VideoIcon style={{ marginRight: '10px', width: '24px', height: '24px' }} />}
                        />
                    ) : (
                        <Button
                            label={t('6_result_page.download_video_button.generate')}
                            className="full-width"
                            variant="contained"
                            color="secondary"
                            onClick={generateBrowserVideo}
                            disabled={browserSupport?.supported !== true}
                            style={{ width: '100%' }}
                            leftIcon={<VideoIcon style={{ marginRight: '10px', width: '24px', height: '24px' }} />}
                        />
                    )}
                </Tooltip>
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
                title={t('6_result_page.download_video_button.modal_title')}
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
                    {t('6_result_page.download_video_button.keep_page_open')}
                </Text>
            </Modal>
            <Loader isLoading={isLoading} />
        </Container>
    );
}
