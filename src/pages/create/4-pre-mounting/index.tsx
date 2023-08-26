import { useRouter } from 'next/router';
import React from 'react';

import { useScenario } from 'src/api/scenarios/scenarios.get';
import { useTheme } from 'src/api/themes/themes.get';
import { DiaporamaCard } from 'src/components/create/DiaporamaCard';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import { NextButton } from 'src/components/navigation/NextButton';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { useTranslation } from 'src/i18n/useTranslation';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';

const PreMountingPage = () => {
    const router = useRouter();
    const { t, currentLocale } = useTranslation();
    const { project, questions, isLoading: isProjectLoading } = useCurrentProject();
    const { theme, isLoading: isThemeLoading } = useTheme(project ? project.themeId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });
    const { scenario } = useScenario(project ? project.scenarioId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });

    return (
        <Container>
            <ThemeBreadcrumbs theme={theme} isLoading={isThemeLoading}></ThemeBreadcrumbs>
            <Steps
                activeStep={3}
                themeId={project ? project.themeId : undefined}
                scenarioName={scenario?.names?.[currentLocale] || undefined}
            ></Steps>
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '2rem' }}>
                <Title color="primary" variant="h1" marginY="md">
                    <Inverted isRound>4</Inverted>{' '}
                    <Trans i18nKey="part4_title">
                        Création du <Inverted>Storyboard</Inverted>
                    </Trans>
                </Title>
                <Title color="inherit" variant="h2">
                    {t('part4_subtitle1')}
                </Title>
                {questions.map((q, index) => {
                    const hasBeenEdited = q.title !== null || (q.plans || []).some((plan) => plan.description || plan.imageUrl);
                    return (
                        <div key={index}>
                            <Title color="primary" variant="h2" marginTop="lg">
                                {index + 1}. {q.question}
                            </Title>
                            {hasBeenEdited ? (
                                <div className="plans">
                                    <DiaporamaCard projectId={project?.id || null} sequence={q} questionIndex={index} />
                                </div>
                            ) : (
                                <p>{t('part4_placeholder')}</p>
                            )}
                        </div>
                    );
                })}
                <NextButton
                    onNext={() => {
                        router.push(`/create/5-music${serializeToQueryUrl({ projectId: project?.id || null })}`);
                    }}
                />
            </div>
        </Container>
    );
};

export default PreMountingPage;
