import React from 'react';

import PictureAsPdf from '@mui/icons-material/PictureAsPdf';
import SmartDisplay from '@mui/icons-material/SmartDisplay';
import VideoFile from '@mui/icons-material/VideoFile';
import { Box, Button, Typography } from '@mui/material';
import type { Theme as MaterialTheme } from '@mui/material/styles';

import { getProjectMlt } from 'src/api/projects/projects.mlt';
import type { GetPDFParams } from 'src/api/projects/projects.pdf';
import { getProjectPdf } from 'src/api/projects/projects.pdf';
import { useScenario } from 'src/api/scenarios/scenarios.get';
import { useTheme } from 'src/api/themes/themes.get';
import { DiaporamaPlayer } from 'src/components/DiaporamaPlayer';
import { getSounds } from 'src/components/DiaporamaPlayer/lib/get-sounds';
import { Flex } from 'src/components/layout/Flex';
import { Loader } from 'src/components/layout/Loader';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';
import { projectContext } from 'src/contexts/projectContext';
import { useTranslation } from 'src/i18n/useTranslation';

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

const ResultPage = () => {
    const { t, currentLocale } = useTranslation();
    const { project, questions, isLoading: isProjectLoading } = React.useContext(projectContext);
    const { theme, isLoading: isThemeLoading } = useTheme(project ? project.themeId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });
    const { scenario } = useScenario(project ? project.scenarioId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });
    const sounds = React.useMemo(() => getSounds(questions), [questions]);

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
        const url = await getProjectPdf(data);
        if (url) {
            window.open(`/static/pdf/${url}`);
        }
    };

    const generateMLT = async () => {
        const data = getData();
        if (!data) {
            return;
        }
        const url = await getProjectMlt(data);
        if (url) {
            const link = document.createElement('a');
            link.href = `/static/xml/${url}`;
            link.download = 'Montage.zip';
            link.click();
        }
    };

    const generateMP4 = () => {
        // todo
    };

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
                    <Button className="full-width" variant="contained" color="secondary" onClick={generateMP4}>
                        <SmartDisplay style={{ marginRight: '10px' }} />
                        {t('part6_mp4_button')}
                    </Button>
                    <div className="or-horizontal-divider">
                        <Box sx={styles.verticalLine} />
                        <Box component="span" sx={styles.secondaryColor}>
                            {t('or').toUpperCase()}
                        </Box>
                        <Box sx={styles.verticalLine} />
                    </div>
                    <Button className="full-width" variant="contained" color="secondary" onClick={generatePDF}>
                        <PictureAsPdf style={{ marginRight: '10px' }} />
                        {t('part6_pdf_button')}
                    </Button>
                    <div className="or-horizontal-divider">
                        <Box sx={styles.verticalLine} />
                        <Box component="span" sx={styles.secondaryColor}>
                            {t('or').toUpperCase()}
                        </Box>
                        <Box sx={styles.verticalLine} />
                    </div>
                    <Button className="full-width" variant="contained" color="secondary" onClick={generateMLT}>
                        <VideoFile style={{ marginRight: '10px' }} />
                        {t('part6_mlt_button')}
                    </Button>
                </Flex>
            </div>
            <Loader isLoading={false} />
        </div>
    );
};

export default ResultPage;
