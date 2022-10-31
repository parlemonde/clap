import React from 'react';

import PictureAsPdf from '@mui/icons-material/PictureAsPdf';
import SmartDisplay from '@mui/icons-material/SmartDisplay';
import VideoFile from '@mui/icons-material/VideoFile';
import VideocamIcon from '@mui/icons-material/Videocam';
import { Box, Backdrop, Button, CircularProgress, Typography } from '@mui/material';
import type { Theme as MaterialTheme } from '@mui/material/styles';

import { Inverted } from 'src/components/Inverted';
import { Trans } from 'src/components/Trans';
import { DiaporamaPlayer } from 'src/components/create/DiaporamaPlayer';
import { Steps } from 'src/components/create/Steps';
import { ThemeLink } from 'src/components/create/ThemeLink';
import { useTranslation } from 'src/i18n/useTranslation';
import { UserServiceContext } from 'src/services/UserService';
import { ProjectServiceContext } from 'src/services/useProject';
import { getQuestions } from 'src/util';

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

const ToCamera: React.FunctionComponent = () => {
    const { t, currentLocale } = useTranslation();
    const { axiosLoggedRequest } = React.useContext(UserServiceContext);
    const { project } = React.useContext(ProjectServiceContext);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const questions = getQuestions(project);

    const getData = () => {
        if (project === null || project.theme === null || project.scenario === null) {
            return;
        }
        return {
            projectId: project.id,
            themeId: project.theme.id,
            themeName: project.theme.names[currentLocale] || project.theme.names.fr || '',
            scenarioId: project.scenario.id,
            scenarioName: project.scenario.name,
            scenarioDescription: '',
            questions: project.questions,
            languageCode: currentLocale,
            sound: project.sound,
            musicBeginTime: project.musicBeginTime,
        };
    };

    const generatePDF = async () => {
        if (project === null || project.theme === null || project.scenario === null) {
            return;
        }
        setIsLoading(true);
        const response = await axiosLoggedRequest({
            method: 'POST',
            url: '/projects/pdf',
            data: getData(),
        });
        setIsLoading(false);
        if (!response.error) {
            window.open(`/static/pdf/${response.data.url}`);
        }
    };
    const generateMLT = async () => {
        if (project === null || project.theme === null || project.scenario === null) {
            return;
        }
        setIsLoading(true);
        const response = await axiosLoggedRequest({
            method: 'POST',
            url: '/projects/mlt',
            data: getData(),
        });
        setIsLoading(false);
        console.log(response);
    };
    const generateMP4 = async () => {};

    return (
        <div>
            <ThemeLink />
            <Steps activeStep={5} />
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '2rem' }}>
                <Typography color="primary" variant="h1">
                    <Inverted round>4</Inverted>{' '}
                    <Trans i18nKey="part6_title">
                        À votre <Inverted>caméra</Inverted> !
                    </Trans>
                    <VideocamIcon
                        fontSize="large"
                        color="primary"
                        style={{
                            transform: 'translateY(0.5rem)',
                            marginLeft: '1.5rem',
                        }}
                    />
                </Typography>

                <Backdrop
                    sx={{
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                        color: '#fff',
                    }}
                    open={isLoading}
                    onClick={() => {}}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
                <Typography variant="h2" style={{ marginBottom: '1rem' }}>
                    {t('part6_subtitle1')}
                </Typography>

                <div>
                    <DiaporamaPlayer questions={questions} mountingPlans={false} questionIndex={0} videoOnly={true} />
                </div>

                <Typography variant="h2" style={{ marginBottom: '1rem', marginTop: '50px' }}>
                    {t('part6_subtitle2')}
                </Typography>
                <div className="text-center" style={{ maxWidth: '400px', margin: 'auto', display: 'flex', flexDirection: 'column' }}>
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
                </div>
            </div>
        </div>
    );
};

export default ToCamera;
