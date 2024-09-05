import { VideoIcon } from '@radix-ui/react-icons';
import React from 'react';

import { getProjectMlt } from 'src/api/projects/projects.mlt';
import type { GetPDFParams } from 'src/api/projects/projects.pdf';
import { useProjectVideo } from 'src/api/projects/projects.video.get';
import { useCreateProjectVideoMutation } from 'src/api/projects/projects.video.post';
import { useScenario } from 'src/api/scenarios/scenarios.get';
import { useTheme } from 'src/api/themes/themes.get';
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
import { userContext } from 'src/contexts/userContext';
import { useCollaboration } from 'src/hooks/useCollaboration';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { useSocket } from 'src/hooks/useSocket';
import { useTranslation } from 'src/i18n/useTranslation';
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

const ResultPage = () => {
    const { t, currentLocale } = useTranslation();
    const { project, questions, isLoading: isProjectLoading } = useCurrentProject();
    const { user } = React.useContext(userContext);
    const { theme, isLoading: isThemeLoading } = useTheme(project ? project.themeId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });
    const { scenario } = useScenario(project ? project.scenarioId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });
    const { isCollaborationActive } = useCollaboration();
    const { socket, connectTeacher } = useSocket();
    const [isLoading, setIsLoading] = React.useState(false);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const {
        projectVideo,
        isLoading: isLoadingProjectVideo,
        refetch,
    } = useProjectVideo(project?.id ?? 0, {
        enabled: project !== undefined && project.id !== 0,
    });
    const sounds = React.useMemo(() => getSounds(questions), [questions]);
    const isDownloading = projectVideo !== undefined && projectVideo.progress < 100;

    // Automatically refresh the video download progress
    const intervalRef = React.useRef<number | null>(null);
    if (isDownloading && intervalRef.current === null) {
        intervalRef.current = window.setInterval(() => {
            refetch();
        }, 1000);
    }
    if (!isDownloading && intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
    }

    // Automatically download the video when it's ready
    const willAutoDownload = React.useRef(false);
    const downloadVideoRef = React.useRef<HTMLAnchorElement | null>(null);
    React.useEffect(() => {
        if (projectVideo !== undefined && projectVideo.url && willAutoDownload.current && downloadVideoRef.current) {
            willAutoDownload.current = false;
            downloadVideoRef.current.click();
        }
    }, [projectVideo]);

    if (isDownloading && !isGenerating) {
        setIsGenerating(true);
        willAutoDownload.current = true;
    }

    React.useEffect(() => {
        if (isCollaborationActive && socket.connected === false && project !== undefined && project.id) {
            connectTeacher(project);
        }
    }, [isCollaborationActive, socket, project]);

    const getData = (): GetPDFParams | undefined => {
        if (!project) {
            return;
        }
        return {
            projectId: project.id,
            projectTitle: project.title,
            themeId: project.themeId,
            themeName: theme?.names?.[currentLocale] || theme?.names?.fr || '',
            scenarioId: project.scenarioId,
            scenarioName: scenario ? scenario.names[currentLocale] || scenario.names[Object.keys(scenario.names)[0]] || '' : '',
            scenarioDescription: scenario
                ? scenario.descriptions[currentLocale] || scenario.descriptions[Object.keys(scenario.descriptions)[0]] || ''
                : '',
            questions,
            languageCode: currentLocale,
            soundUrl: project.soundUrl,
            soundVolume: project.soundVolume,
            musicBeginTime: project.musicBeginTime,
        };
    };

    const generateMLT = async () => {
        const data = getData();
        if (!data) {
            return;
        }
        setIsLoading(true);
        const url = await getProjectMlt(data);
        setIsLoading(false);
        if (url) {
            const link = document.createElement('a');
            link.href = `/static/xml/${url}`;
            link.download = 'Montage.zip';
            link.click();
        }
    };

    const createProjectVideoMutation = useCreateProjectVideoMutation();
    const generateMP4 = () => {
        const data = getData();
        if (!project || project.id === 0 || !data) {
            return;
        }
        setIsGenerating(true);
        createProjectVideoMutation.mutate(
            {
                projectId: project.id,
                data,
            },
            {
                onSuccess: () => {
                    willAutoDownload.current = true;
                },
                onError: () => {
                    setIsGenerating(false);
                    sendToast({ message: t('unknown_error'), type: 'error' });
                },
            },
        );
    };

    const videoUrl = projectVideo?.url;
    const videoProgress = projectVideo?.progress;
    const hasProject = project !== undefined && project.id !== 0;

    return (
        <Container>
            <ThemeBreadcrumbs theme={theme} isLoading={isThemeLoading}></ThemeBreadcrumbs>
            <Steps
                activeStep={5}
                themeId={project ? project.themeId : undefined}
                scenarioName={scenario?.names?.[currentLocale] || undefined}
            ></Steps>
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '2rem' }}>
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
                    {project && !isProjectLoading && (
                        <DiaporamaPlayer
                            questions={questions}
                            soundUrl={project.soundUrl || ''}
                            volume={project.soundVolume || 100}
                            setVolume={() => {}}
                            soundBeginTime={project.musicBeginTime || 0}
                            setSoundBeginTime={() => {}}
                            sounds={sounds}
                        />
                    )}
                </div>

                <Title variant="h2" style={{ margin: '16px 0' }}>
                    {t('part6_subtitle2')}
                </Title>

                <Flex flexDirection="column" alignItems="center" marginX="auto" marginY="lg" style={{ maxWidth: '400px' }}>
                    {isLoadingProjectVideo ? (
                        <div>loading</div>
                    ) : (
                        <>
                            {!videoUrl && isGenerating ? (
                                <div
                                    style={{
                                        width: '100%',
                                        textAlign: 'center',
                                        padding: '0.5rem 1rem',
                                        border: '1px solid #79C3A5',
                                        boxSizing: 'border-box',
                                        borderRadius: 4,
                                        boxShadow:
                                            '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)',
                                    }}
                                >
                                    <Text className="color-secondary" style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                                        {t('part6_mp4_loading')}
                                    </Text>
                                    <LinearProgressWithLabel value={videoProgress === 100 ? 0 : videoProgress ?? 0} />
                                </div>
                            ) : videoUrl && isGenerating ? (
                                <Button
                                    label={t('part6_mp4_download_button')}
                                    as="a"
                                    ref={downloadVideoRef}
                                    href={videoUrl}
                                    className="full-width"
                                    variant="contained"
                                    color="secondary"
                                    style={{ width: '100%' }}
                                    leftIcon={<VideoIcon style={{ marginRight: '10px', width: '24px', height: '24px' }} />}
                                    download
                                />
                            ) : (
                                <Tooltip
                                    content={user === null ? t('part6_mp4_user_disabled') : !hasProject ? t('part6_mp4_project_disabled') : ''}
                                    hasArrow
                                >
                                    <Button
                                        label={t('part6_mp4_download_button')}
                                        className="full-width"
                                        variant="contained"
                                        color="secondary"
                                        onClick={generateMP4}
                                        disabled={user === null || !hasProject}
                                        style={{ width: '100%' }}
                                        leftIcon={<VideoIcon style={{ marginRight: '10px', width: '24px', height: '24px' }} />}
                                    ></Button>
                                </Tooltip>
                            )}
                        </>
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
            </div>
            <Loader isLoading={isLoading} />
        </Container>
    );
};

export default ResultPage;
