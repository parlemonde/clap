'use client';

import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import * as React from 'react';

import { Container } from '@frontend/components/layout/Container';
import { Title } from '@frontend/components/layout/Typography';
import { NextButton } from '@frontend/components/navigation/NextButton';
import { Steps } from '@frontend/components/navigation/Steps';
import { ThemeBreadcrumbs } from '@frontend/components/navigation/ThemeBreadcrumbs';
import { Inverted } from '@frontend/components/ui/Inverted';
import { useCollaboration } from '@frontend/hooks/useCollaboration';
import { useCurrentProject } from '@frontend/hooks/useCurrentProject';
import type { ServerPageProps } from '@lib/page-props.types';
import type { Title as SequenceTitle } from '@server/database/schemas/projects';

import { TitleForm } from './TitleForm';

const getDefaultTitle = (question: string): SequenceTitle => ({
    text: question,
    duration: 3000,
    x: 15,
    y: 30,
    width: 70,
    fontSize: 8,
    fontFamily: 'serif',
    color: 'white',
    backgroundColor: 'black',
    textAlign: 'center',
});

export default function StoryboardTitlePage(props: ServerPageProps) {
    const router = useRouter();

    const tx = useExtracted('create.3-storyboard.title');
    const commonT = useExtracted('common');
    const { projectData, setProjectData } = useCurrentProject();
    useCollaboration(); // Listen to collaboration updates

    const searchParams = React.use(props.searchParams);
    const questionIndex = typeof searchParams.question === 'string' ? Number(searchParams.question) : undefined;
    const [newTitle, setNewTitle] = React.useState<SequenceTitle | null>(null);

    if (!projectData || questionIndex === undefined || !projectData.questions[questionIndex]) {
        return null;
    }

    const sequence = projectData.questions[questionIndex];
    const title = sequence.title || getDefaultTitle(sequence.question);

    return (
        <Container paddingBottom="xl">
            <ThemeBreadcrumbs themeId={projectData.themeId}></ThemeBreadcrumbs>
            <Steps activeStep={2} themeId={projectData.themeId} backHref="/create/3-storyboard"></Steps>
            <Title color="primary" variant="h1" marginY="md">
                <Inverted isRound>3</Inverted> {tx('Création du titre de la séquence n° {planNumber}', { planNumber: String(questionIndex + 1) })}
            </Title>
            <Title color="inherit" variant="h2">
                {tx('Séquence : {sequenceName}', {
                    sequenceName: sequence.question,
                })}
            </Title>
            <Title color="inherit" variant="h2" marginTop="md">
                {tx(
                    "Pour chaque séquence, vous pouvez choisir d'ajouter un titre. Par défaut, il s'agit du titre de la séquence, mais vous pouvez le modifier !",
                )}
            </Title>
            <TitleForm title={newTitle || title} onTitleChange={setNewTitle} />
            <NextButton
                label={commonT('Continuer')}
                backHref="/create/3-storyboard"
                onNext={() => {
                    const newQuestions = [...projectData.questions];
                    newQuestions[questionIndex] = { ...sequence, title: newTitle || title };
                    setProjectData({ ...projectData, questions: newQuestions });
                    router.push('/create/3-storyboard');
                }}
            />
        </Container>
    );
}
