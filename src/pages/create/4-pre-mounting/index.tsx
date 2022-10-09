import { useRouter } from 'next/router';
import React from 'react';

import VideocamIcon from '@mui/icons-material/Videocam';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { Inverted } from 'src/components/Inverted';
import { SequenceDiaporama } from 'src/components/create/SequenceDiaporama';
import { Steps } from 'src/components/create/Steps';
import { ThemeLink } from 'src/components/create/ThemeLink';
import { useTranslation } from 'src/i18n/useTranslation';
import { ProjectServiceContext } from 'src/services/useProject';
import { getQuestions } from 'src/util';

const PreMounting: React.FunctionComponent = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const { project } = React.useContext(ProjectServiceContext);
    const questions = getQuestions(project);

    const handleNext = (event: React.MouseEvent) => {
        event.preventDefault();
        router.push(`/create/5-music`);
    };

    return (
        <div>
            <ThemeLink />
            <Steps activeStep={3} />
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '2rem' }}>
                <Typography color="primary" variant="h1">
                    <Inverted round>4</Inverted> {t('part4_title')}
                    <VideocamIcon
                        fontSize="large"
                        color="primary"
                        style={{
                            transform: 'translateY(0.5rem)',
                            marginLeft: '1.5rem',
                        }}
                    />
                </Typography>

                <Typography variant="h2" style={{ marginBottom: '1rem' }}>
                    {t('part4_subtitle1')}
                </Typography>

                {questions.map((q, index) => {
                    let hasBeenEdited = false;
                    if (q.title != null) hasBeenEdited = true;
                    (q.plans || []).map((p) => {
                        if (p.description !== '' || p.url != null) hasBeenEdited = true;
                    });
                    return (
                        <div key={index}>
                            <Typography color="primary" variant="h2">
                                {index + 1}. {q.question}
                            </Typography>
                            <div>{hasBeenEdited ? <SequenceDiaporama questionIndex={index} /> : <p>{t('part4_placeholder')}</p>}</div>
                        </div>
                    );
                })}
                <Box sx={{ display: { xs: 'none', md: 'block' } }} style={{ width: '100%', textAlign: 'right', marginTop: '2rem' }}>
                    <Button
                        component="a"
                        href={`/create/5-music`}
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
                    href={`/create/5-music`}
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

export default PreMounting;
