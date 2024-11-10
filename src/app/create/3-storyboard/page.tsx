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

export default function StoryboardPage() {
    const { t } = useTranslation();
    const [project] = useCurrentProject();

    if (!project) {
        return null;
    }

    return (
        <Container paddingBottom="xl">
            <ThemeBreadcrumbs themeId={project.themeId}></ThemeBreadcrumbs>
            <Steps activeStep={2} themeId={project.themeId}></Steps>
            <Title color="primary" variant="h1" marginY="md">
                <Inverted isRound>3</Inverted>{' '}
                <Trans i18nKey="part3_title">
                    Création du <Inverted>Storyboard</Inverted>
                </Trans>
            </Title>
            <Title color="inherit" variant="h2">
                {t('part3_desc')}
            </Title>
        </Container>
    );
}
