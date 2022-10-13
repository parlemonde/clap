import { useRouter } from 'next/router';
import React from 'react';

import CloudUploadIcon from '@mui/icons-material/Upload';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { Inverted } from 'src/components/Inverted';
import { DiaporamaPlayer } from 'src/components/create/DiaporamaPlayer';
import { Steps } from 'src/components/create/Steps';
import { ThemeLink } from 'src/components/create/ThemeLink';
import { useTranslation } from 'src/i18n/useTranslation';
import { ProjectServiceContext } from 'src/services/useProject';
import { useProjectRequests } from 'src/services/useProjects';
import { getQuestions } from 'src/util';

const Music: React.FunctionComponent = () => {
    const router = useRouter();
    const { uploadProjectSound } = useProjectRequests();
    const { t } = useTranslation();
    const { project } = React.useContext(ProjectServiceContext);
    const questions = getQuestions(project);
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    const handleNext = (event: React.MouseEvent) => {
        event.preventDefault();
        router.push(`/create/6-to-your-camera`);
    };

    const uploadSound = async (url: string) => {
        const blobSound = await fetch(url).then((r) => r.blob());
        await uploadProjectSound(blobSound);
    };

    const handleInputchange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files !== null && event.target.files.length > 0) {
            const url = URL.createObjectURL(event.target.files[0]);
            uploadSound(url);
        }
    };

    return (
        <div>
            <ThemeLink />
            <Steps activeStep={4} />
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '2rem' }}>
                <Typography color="primary" variant="h1">
                    <Inverted round>5</Inverted> {t('part5_title')}
                </Typography>

                <Typography variant="h2" style={{ marginBottom: '1rem' }}>
                    {t('part5_subtitle1')}
                </Typography>

                <div>
                    <DiaporamaPlayer questions={questions} mountingPlans={false} questionIndex={0} videoOnly={false} />
                </div>

                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                    <input
                        id="plan-img-upload"
                        type="file"
                        accept="audio/mp3"
                        onChange={handleInputchange}
                        ref={inputRef}
                        style={{ display: 'none' }}
                    />
                    <Button
                        variant="outlined"
                        color="secondary"
                        component="label"
                        htmlFor="plan-img-upload"
                        style={{ textTransform: 'none' }}
                        startIcon={<CloudUploadIcon />}
                    >
                        {t('import_music')}
                    </Button>
                </div>

                <Box sx={{ display: { xs: 'none', md: 'block' } }} style={{ width: '100%', textAlign: 'right', marginTop: '2rem' }}>
                    <Button
                        component="a"
                        href={`/create/6-to-your-camera`}
                        color="secondary"
                        onClick={handleNext}
                        variant="contained"
                        style={{ width: '200px' }}
                    >
                        {t('next')}
                    </Button>
                </Box>
                <Button
                    sx={{ display: { xs: 'inline-flex', md: 'none' } }}
                    component="a"
                    href={`/create/6-to-your-camera`}
                    color="secondary"
                    onClick={handleNext}
                    variant="contained"
                    style={{ width: '100%', marginTop: '2rem' }}
                >
                    {t('next')}
                </Button>
            </div>
        </div>
    );
};

export default Music;
