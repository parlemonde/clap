import { useSnackbar } from 'notistack';
import React from 'react';

import PictureAsPdf from '@mui/icons-material/PictureAsPdf';
import SmartDisplay from '@mui/icons-material/SmartDisplay';
import VideoFile from '@mui/icons-material/VideoFile';
import type { LinearProgressProps } from '@mui/material';
import { Tooltip, Box, Button, LinearProgress, Typography } from '@mui/material';
import type { Theme as MaterialTheme } from '@mui/material/styles';

import { getProjectMlt } from 'src/api/projects/projects.mlt';
import type { GetPDFParams } from 'src/api/projects/projects.pdf';
import { getProjectPdf } from 'src/api/projects/projects.pdf';
import { useProjectVideo } from 'src/api/projects/projects.video.get';
import { useCreateProjectVideoMutation } from 'src/api/projects/projects.video.post';
import { useScenario } from 'src/api/scenarios/scenarios.get';
import { useTheme } from 'src/api/themes/themes.get';
import { DiaporamaPlayer } from 'src/components/DiaporamaPlayer';
import { Flex } from 'src/components/layout/Flex';
import { Loader } from 'src/components/layout/Loader';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import Modal from 'src/components/ui/Modal';
import { Trans } from 'src/components/ui/Trans';
import { userContext } from 'src/contexts/userContext';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { useTranslation } from 'src/i18n/useTranslation';
import { getSounds } from 'src/lib/get-sounds';

const styles = {
    verticalLine: {
        backgroundColor: (theme: MaterialTheme) => theme.palette.secondary.main,
        flex: 1,
        width: '1px',
        margin: '0.2rem 0',
    },
    horizontalLine: {
        backgroundColor: (theme: MaterialTheme) => theme.palette.secondary.main,
        flex: 1,
        height: '1px',
        margin: '2rem 1rem',
    },
    secondaryColor: {
        color: (theme: MaterialTheme) => theme.palette.secondary.main,
    },
};

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress variant="determinate" {...props} />
            </Box>
            <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">{`${Math.round(props.value)}%`}</Typography>
            </Box>
        </Box>
    );
}

const Or = () => {
    const { t } = useTranslation();
    return (
        <div className="or-horizontal-divider">
            <Box sx={styles.verticalLine} />
            <Box component="span" sx={styles.secondaryColor}>
                {t('or').toUpperCase()}
            </Box>
            <Box sx={styles.verticalLine} />
        </div>
    );
};

const ResultPage = () => {
    const { t, currentLocale } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();
    const { project, questions, isLoading: isProjectLoading } = useCurrentProject();
    const { user } = React.useContext(userContext);
    const { theme, isLoading: isThemeLoading } = useTheme(project ? project.themeId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });
    const { scenario } = useScenario(project ? project.scenarioId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });
    const [isLoading, setIsLoading] = React.useState(false);
    const [isVideoModalOpen, setIsVideoModalOpen] = React.useState(false);
    const {
        projectVideo,
        isLoading: isLoadingProjectVideo,
        refetch,
    } = useProjectVideo(project?.id ?? 0, {
        enabled: project !== undefined && project.id !== 0,
    });
    const sounds = React.useMemo(() => getSounds(questions), [questions]);

    React.useEffect(() => {
        if (projectVideo !== undefined && projectVideo.progress < 100) {
            const timeout = window.setTimeout(refetch, 1000);
            return () => {
                window.clearTimeout(timeout);
            };
        }
        return () => {};
    }, [projectVideo, refetch]);

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

    const generatePDF = async () => {
        const data = getData();
        if (!data) {
            return;
        }
        setIsLoading(true);
        const url = await getProjectPdf(data);
        setIsLoading(false);
        if (url) {
            window.open(`/static/pdf/${url}`);
        }
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
        createProjectVideoMutation.mutate(
            {
                projectId: project.id,
                data,
            },
            {
                onSettled: () => {
                    setIsVideoModalOpen(false);
                },
                onError: () => {
                    enqueueSnackbar(t('unknown_error'), {
                        variant: 'error',
                    });
                },
            },
        );
    };

    const videoUrl = projectVideo?.url;
    const videoProgress = projectVideo?.progress;
    const hasProject = project !== undefined && project.id !== 0;

    return (
        <div>
            <ThemeBreadcrumbs theme={theme} isLoading={isThemeLoading}></ThemeBreadcrumbs>
            <Steps
                activeStep={5}
                themeId={project ? project.themeId : undefined}
                scenarioName={scenario?.names?.[currentLocale] || undefined}
            ></Steps>
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '2rem' }}>
                <Typography color="primary" variant="h1">
                    <Inverted round>6</Inverted>
                    <Trans i18nKey="part6_title">
                        À votre <Inverted>caméra</Inverted> !
                    </Trans>
                </Typography>
                <Typography color="inherit" variant="h2">
                    {t('part6_subtitle1')}
                </Typography>

                <div style={{ margin: '2rem 0' }}>
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

                <Typography variant="h2" style={{ margin: '1rem 0' }}>
                    {t('part6_subtitle2')}
                </Typography>

                <Flex flexDirection="column" alignItems="center" style={{ maxWidth: '400px', margin: '0 auto 2rem auto' }}>
                    {isLoadingProjectVideo ? (
                        <div>loading</div>
                    ) : (
                        <>
                            {videoUrl && (
                                <>
                                    <Button component="a" href={videoUrl} className="full-width" variant="contained" color="secondary" download>
                                        <SmartDisplay style={{ marginRight: '10px' }} />
                                        {t('part6_mp4_download_button')}
                                    </Button>
                                    <Or />
                                </>
                            )}
                            {videoProgress && videoProgress !== 100 ? (
                                <div
                                    style={{
                                        width: '100%',
                                        textAlign: 'center',
                                        padding: '0.5rem 1rem',
                                        border: '1px solid #79C3A5',
                                        borderRadius: 4,
                                        boxShadow:
                                            '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)',
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary" style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                                        {t('part6_mp4_loading')}
                                    </Typography>
                                    <LinearProgressWithLabel color="secondary" variant="buffer" value={videoProgress} />
                                </div>
                            ) : (
                                <Tooltip
                                    title={user === null ? t('part6_mp4_user_disabled') : !hasProject ? t('part6_mp4_project_disabled') : ''}
                                    placement="top"
                                    arrow
                                >
                                    <span style={{ width: '100%' }}>
                                        <Button
                                            className="full-width"
                                            variant="contained"
                                            color="secondary"
                                            onClick={() => {
                                                setIsVideoModalOpen(true);
                                            }}
                                            disabled={user === null || !hasProject}
                                        >
                                            <SmartDisplay style={{ marginRight: '10px' }} />
                                            {t(videoUrl ? 'part6_mp4_generate_button' : 'part6_mp4_button')}
                                        </Button>
                                    </span>
                                </Tooltip>
                            )}
                        </>
                    )}
                    <Or />
                    <Button className="full-width" variant="contained" color="secondary" onClick={generatePDF}>
                        <PictureAsPdf style={{ marginRight: '10px' }} />
                        {t('part6_pdf_button')}
                    </Button>
                    <Or />
                    <Button className="full-width" variant="contained" color="secondary" onClick={generateMLT}>
                        <VideoFile style={{ marginRight: '10px' }} />
                        {t('part6_mlt_button')}
                    </Button>
                </Flex>
                <Modal
                    isOpen={isVideoModalOpen}
                    onClose={() => {
                        setIsVideoModalOpen(false);
                    }}
                    isLoading={createProjectVideoMutation.isLoading}
                    title={t('part6_mp4_button')}
                    confirmLabel={t('generate')}
                    onConfirm={generateMP4}
                    maxWidth="sm"
                    isFullWidth
                    confirmLevel="secondary"
                    ariaLabelledBy="download_title"
                    ariaDescribedBy="download_desc"
                >
                    <ul style={{ margin: 0 }}>
                        <li style={{ marginBottom: '0.5rem' }}>{t('part6_mp4_description_1')}</li>
                        <li style={{ marginBottom: '0.5rem' }}>{t('part6_mp4_description_2')}</li>
                        <li style={{ marginBottom: '0.5rem' }}>{t('part6_mp4_description_3')}</li>
                    </ul>
                </Modal>
            </div>
            <Loader isLoading={isLoading} />
        </div>
    );
};

export default ResultPage;
