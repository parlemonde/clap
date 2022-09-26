import React from 'react';

import VideocamIcon from '@mui/icons-material/Videocam';
import Typography from '@mui/material/Typography';

import { Inverted } from 'src/components/Inverted';
import { SequenceDiaporama } from 'src/components/create/SequenceDiaporama';
import { Steps } from 'src/components/create/Steps';
import { ThemeLink } from 'src/components/create/ThemeLink';
import { useTranslation } from 'src/i18n/useTranslation';
import { UserServiceContext } from 'src/services/UserService';
import { ProjectServiceContext } from 'src/services/useProject';
import { getQuestions } from 'src/util';

const PreMounting: React.FunctionComponent = () => {
    const { t } = useTranslation();
    const { axiosLoggedRequest } = React.useContext(UserServiceContext);
    const { project } = React.useContext(ProjectServiceContext);
    const questions = getQuestions(project);

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
                    q.plans.map((p) => {
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
            </div>
        </div>
    );
};

export default PreMounting;
