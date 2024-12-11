'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { Scenario } from './Scenario';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import { NextButton } from 'src/components/navigation/NextButton';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';
import { useTranslation } from 'src/contexts/translationContext';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import type { Sequence } from 'src/hooks/useLocalStorage/local-storage';

export default function StoryboardPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [project, setProject] = useCurrentProject();

    if (!project) {
        return null;
    }

    const startIndexPerSequence: Partial<Record<number, number>> = {};
    project.questions.reduce<number>((acc, sequence, index) => {
        startIndexPerSequence[index] = acc;
        return acc + (sequence.plans || []).length;
    }, 1);

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
            {project.questions.map((sequence, index) => (
                <Scenario
                    key={sequence.id}
                    sequence={sequence}
                    sequenceIndex={index}
                    planStartIndex={startIndexPerSequence[index] || 0}
                    onUpdateSequence={(newSequence: Sequence) => {
                        const newQuestions = [...project.questions];
                        newQuestions[index] = newSequence;
                        setProject({ ...project, questions: newQuestions });
                    }}
                />
            ))}
            <NextButton
                onNext={() => {
                    router.push('/create/4-pre-mounting');
                }}
            />
        </Container>
    );
}
