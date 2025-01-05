'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { DiaporamaCard } from 'src/components/create/DiaporamaCard';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import { NextButton } from 'src/components/navigation/NextButton';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';
import { useTranslation } from 'src/contexts/translationContext';
import { useCurrentProject } from 'src/hooks/useCurrentProject';

export default function PreMountingPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [project] = useCurrentProject();

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
            <Steps activeStep={3} themeId={project.themeId}></Steps>
            <Title color="primary" variant="h1" marginY="md">
                <Inverted isRound>4</Inverted>{' '}
                <Trans i18nKey="part4_title">
                    Prémontez votre <Inverted>film</Inverted>
                </Trans>
            </Title>
            <Title color="inherit" variant="h2">
                {t('part4_subtitle1')}
            </Title>
            {project.questions.map((q, index) => {
                const hasBeenEdited = q.title !== undefined || (q.plans || []).some((plan) => plan.description || plan.imageUrl);
                return (
                    <div key={index}>
                        <Title color="primary" variant="h2" marginTop="lg" style={{ marginTop: '2rem', display: 'flex', alignItems: 'center' }}>
                            {index + 1}. {q.question}
                        </Title>
                        {hasBeenEdited ? (
                            <div className="plans">
                                <DiaporamaCard sequence={q} questionIndex={index} />
                            </div>
                        ) : (
                            <p style={{ marginTop: '1rem' }}>{t('part4_placeholder')}</p>
                        )}
                    </div>
                );
            })}
            <NextButton
                onNext={() => {
                    router.push('/create/5-music');
                }}
            />
        </Container>
    );
}
