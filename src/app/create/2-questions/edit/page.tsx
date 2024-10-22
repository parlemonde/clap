'use client';

import * as React from 'react';

import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';
import { useTranslation } from 'src/contexts/translationContext';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import type { SearchParams } from 'src/utils/search-params/search-params.types';

export default function ScenarioPage({ searchParams }: { searchParams: SearchParams }) {
    const [project] = useCurrentProject();
    const { t } = useTranslation();

    const questionIndex = typeof searchParams.question === 'string' ? Number(searchParams.question) : undefined;

    if (!project || questionIndex === undefined) {
        return null;
    }

    return (
        <Container paddingBottom="xl">
            <ThemeBreadcrumbs themeId={project.themeId}></ThemeBreadcrumbs>
            <Steps activeStep={1} themeId={project.themeId} scenarioName={'FOO'}></Steps>
            <Title color="primary" marginY="md" variant="h1">
                <Inverted isRound>2</Inverted>{' '}
                <Trans i18nKey="part2_title">
                    Mes <Inverted>séquences</Inverted>
                </Trans>
            </Title>
            <Title color="inherit" variant="h2">
                {t('part2_desc')}
            </Title>
            EDIT question: {project.questions[questionIndex].question}
        </Container>
    );
}
