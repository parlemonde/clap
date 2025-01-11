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
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import type { Title as SequenceTitle } from 'src/hooks/useLocalStorage/local-storage';
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
    const [project, setProject] = useCurrentProject();

    const searchParams = React.use(props.searchParams);
    const questionIndex = typeof searchParams.question === 'string' ? Number(searchParams.question) : undefined;
    const [newTitle, setNewTitle] = React.useState<SequenceTitle | null>(null);

    if (!project || questionIndex === undefined || !project.questions[questionIndex]) {
        return null;
    }

    const sequence = project.questions[questionIndex];
    const title = sequence.title || getDefaultTitle(sequence.question);

    return (
        <Container paddingBottom="xl">
            <ThemeBreadcrumbs themeId={project.themeId}></ThemeBreadcrumbs>
            <Steps activeStep={2} themeId={project.themeId} backHref="/create/3-storyboard"></Steps>
            <Title color="primary" variant="h1" marginY="md">
                <Inverted isRound>3</Inverted> {t('part3_edit_title', { planNumber: questionIndex + 1 })}
            </Title>
            <Title color="inherit" variant="h2">
                <span>{t('part3_question')}</span> {sequence.question}
            </Title>
            <Title color="inherit" variant="h2" marginTop="md">
                <span>{t('part3_edit_title_desc')}</span>
            </Title>
            <TitleForm title={newTitle || title} onTitleChange={setNewTitle} />
            <NextButton
                label={t('continue')}
                backHref="/create/3-storyboard"
                onNext={() => {
                    const newQuestions = [...project.questions];
                    newQuestions[questionIndex] = { ...sequence, title: newTitle || title };
                    setProject({ ...project, questions: newQuestions });
                    router.push('/create/3-storyboard');
                }}
            />
        </Container>
    );
}
