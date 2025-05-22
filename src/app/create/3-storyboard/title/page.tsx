'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { TitleForm } from './TitleForm';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import { NextButton } from 'src/components/navigation/NextButton';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { useTranslation } from 'src/contexts/translationContext';
import type { Title as SequenceTitle } from 'src/database/schemas/projects';
import { useCollaboration } from 'src/hooks/useCollaboration';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import type { ServerPageProps } from 'src/lib/page-props.types';

const getDefaultTitle = (question: string): SequenceTitle => ({
    text: question,
    duration: 1000,
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
    const { t } = useTranslation();
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
                <Inverted isRound>3</Inverted> {t('3_title_storyboard_page.header.title', { planNumber: questionIndex + 1 })}
            </Title>
            <Title color="inherit" variant="h2">
                {t('3_edit_storyboard_page.secondary.question_name', {
                    sequenceName: sequence.question,
                })}
            </Title>
            <Title color="inherit" variant="h2" marginTop="md">
                {t('3_title_storyboard_page.secondary.title')}
            </Title>
            <TitleForm title={newTitle || title} onTitleChange={setNewTitle} />
            <NextButton
                label={t('common.actions.continue')}
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
