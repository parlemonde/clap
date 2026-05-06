'use client';

import { VideoIcon } from '@radix-ui/react-icons';
import { useExtracted } from 'next-intl';
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
    const commonT = useExtracted('common');
    return (
        <div className="or-horizontal-divider">
            <div style={styles.verticalLine} />
            <Text className="color-secondary">{commonT('ou').toUpperCase()}</Text>
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
    const t = useExtracted('create.6-result');
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
    const browserGenerationStageLabel = React.useMemo(() => {
        switch (browserGeneration.stage) {
            case 'checking-support':
                return t('Vérification de la compatibilité du navigateur...');
            case 'loading-assets':
                return t('Chargement des médias...');
            case 'rendering':
                return t('Création des images de la vidéo...');
            case 'finalizing':
                return t('Finalisation de la vidéo...');
            case null:
            case undefined:
                return '';
        }
    }, [browserGeneration.stage, t]);
    const browserSupportReasonLabel = React.useMemo(() => {
        if (browserSupport?.supported !== false) {
            return '';
        }

        switch (browserSupport.reason) {
            case 'missing-webcodecs':
                return t('Votre navigateur ne prend pas en charge la génération vidéo.');
            case 'missing-codecs':
                return t('Votre navigateur ne prend pas en charge les codecs nécessaires à la génération vidéo.');
        }
    }, [browserSupport, t]);

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
                    message: t('Impossible de générer la vidéo avec ce navigateur.'),
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
                    message: t('La vidéo a été enregistrée.'),
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
                        ? t('Cette vidéo est trop longue pour être générée ici. Durée maximale approximative : {maxDuration}.', {
                              maxDuration: getFormatedTime(error.maxDurationMs),
                          })
                        : t('Impossible de générer la vidéo avec ce navigateur.'),
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

    return (
        <Container paddingBottom="xl">
            <ThemeBreadcrumbs themeId={projectData.themeId}></ThemeBreadcrumbs>
            <Steps activeStep={5} themeId={projectData.themeId}></Steps>
            <Title color="primary" variant="h1" marginY="md">
                <Inverted isRound>6</Inverted>
                {t.rich('À votre <inverted>caméra</inverted> !', {
                    inverted: (chunks) => <Inverted>{chunks}</Inverted>,
                })}
            </Title>
            <Title color="inherit" variant="h2">
                {t('À cette étape,  vous pouvez pré-visualiser votre diaporama sonore achevé.')}
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
                {t('Vous pouvez maintenant télécharger ce diaporama ou son fichier de montage pour y intégrer vos plans vidéos.')}
            </Title>
            <Flex flexDirection="column" alignItems="center" marginX="auto" marginY="lg" style={{ maxWidth: '400px' }}>
                <Tooltip
                    content={
                        browserSupport === null
                            ? t('Vérification de la compatibilité du navigateur...')
                            : browserSupport.supported
                              ? ''
                              : browserSupportReasonLabel
                    }
                    hasArrow
                >
                    {browserGeneration.status === 'ready' && browserGeneration.url ? (
                        <Button
                            label={t('Télécharger votre vidéo')}
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
                            label={t('Générer votre vidéo !')}
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
                    label={t('Télécharger le fichier de montage')}
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
                title={t('Création de votre vidéo')}
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
                    {t('Veuillez garder cette page ouverte jusqu’à la fin de la génération.')}
                </Text>
            </Modal>
            <Loader isLoading={isLoading} />
        </Container>
    );
}
