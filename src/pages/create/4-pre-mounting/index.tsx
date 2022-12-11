import { useRouter } from 'next/router';
import React from 'react';

import { Typography } from '@mui/material';

import { useScenario } from 'src/api/scenarios/scenarios.get';
import { useTheme } from 'src/api/themes/themes.get';
import { SequenceDiaporama } from 'src/components/SequenceDiaporama';
import { NextButton } from 'src/components/navigation/NextButton';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';
import { projectContext } from 'src/contexts/projectContext';
import { useTranslation } from 'src/i18n/useTranslation';

const PreMountingPage = () => {
    const router = useRouter();
    const { t, currentLocale } = useTranslation();
    const { project, questions, isLoading: isProjectLoading } = React.useContext(projectContext);
    const { theme, isLoading: isThemeLoading } = useTheme(project ? project.themeId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });
    const { scenario } = useScenario(project ? project.scenarioId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });

    return (
        <div>
            <ThemeBreadcrumbs theme={theme} isLoading={isThemeLoading}></ThemeBreadcrumbs>
            <Steps
                activeStep={3}
                themeId={project ? project.themeId : undefined}
                scenarioName={scenario?.names?.[currentLocale] || undefined}
            ></Steps>
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '2rem' }}>
                <Typography color="primary" variant="h1">
                    <Inverted round>4</Inverted>{' '}
                    <Trans i18nKey="part4_title">
                        Création du <Inverted>Storyboard</Inverted>
                    </Trans>
                </Typography>
                <Typography color="inherit" variant="h2">
                    {t('part4_subtitle1')}
                </Typography>
                {questions.map((q, index) => {
                    const hasBeenEdited = q.title !== null || (q.plans || []).some((plan) => plan.description || plan.imageUrl);
                    return (
                        <div key={index}>
                            <Typography color="primary" variant="h2" style={{ marginTop: '2rem' }}>
                                {index + 1}. {q.question}
                            </Typography>
                            {hasBeenEdited ? (
                                <div className="plans">
                                    <SequenceDiaporama sequence={q} questionIndex={index} />
                                </div>
                            ) : (
                                <p>{t('part4_placeholder')}</p>
                            )}
                        </div>
                    );
                })}
                <NextButton
                    onNext={() => {
                        router.push('/create/5-music');
                    }}
                />
            </div>
        </div>
    );
};

export default PreMountingPage;
