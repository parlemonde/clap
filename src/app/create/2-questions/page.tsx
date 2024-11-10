'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { QuestionsList } from './QuestionsList';
import { Button } from 'src/components/layout/Button';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import { Link } from 'src/components/navigation/Link';
import { NextButton } from 'src/components/navigation/NextButton';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';
import { useTranslation } from 'src/contexts/translationContext';
import { useCurrentProject } from 'src/hooks/useCurrentProject';

export default function QuestionPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [project, setProject] = useCurrentProject();

    if (!project) {
        return null;
    }
    return (
        <Container paddingBottom="xl">
            <ThemeBreadcrumbs themeId={project.themeId}></ThemeBreadcrumbs>
            <Steps activeStep={1} themeId={project.themeId}></Steps>
            <Title color="primary" marginY="md" variant="h1">
                <Inverted isRound>2</Inverted>{' '}
                <Trans i18nKey="part2_title">
                    Mes <Inverted>séquences</Inverted>
                </Trans>
            </Title>
            <Title color="inherit" variant="h2">
                {t('part2_desc')}
            </Title>
            <Link href={`/create/2-questions/new`} passHref legacyBehavior>
                <Button as="a" label={t('add_question')} variant="outlined" color="secondary" marginTop="lg" isUpperCase={false}></Button>
            </Link>
            <QuestionsList project={project} setProject={setProject} />
            <NextButton
                onNext={() => {
                    // if (project !== undefined && project.id === 'local' && user !== null) {
                    //     setShowSaveProjectModal(true);
                    // } else {
                    router.push('/create/3-storyboard');
                }}
            />
        </Container>
    );
}
