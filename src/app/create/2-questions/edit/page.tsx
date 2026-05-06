'use client';

import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import * as React from 'react';

import { Container } from '@frontend/components/layout/Container';
import { Field, Form, Input } from '@frontend/components/layout/Form';
import { Title } from '@frontend/components/layout/Typography';
import { NextButton } from '@frontend/components/navigation/NextButton';
import { Steps } from '@frontend/components/navigation/Steps';
import { ThemeBreadcrumbs } from '@frontend/components/navigation/ThemeBreadcrumbs';
import { Inverted } from '@frontend/components/ui/Inverted';
import { useCollaboration } from '@frontend/hooks/useCollaboration';
import { useCurrentProject } from '@frontend/hooks/useCurrentProject';
import type { ServerPageProps } from '@lib/page-props.types';

export default function ScenarioPage(props: ServerPageProps) {
    const router = useRouter();
    const { projectData, setProjectData } = useCurrentProject();
    useCollaboration(); // Listen to collaboration updates
    const t = useExtracted('create.2-questions.edit');

    const searchParams = React.use(props.searchParams);
    const questionIndex = typeof searchParams.question === 'string' ? Number(searchParams.question) : undefined;

    const [question, setQuestion] = React.useState(questionIndex ? projectData?.questions[questionIndex]?.question || '' : '');

    // Update the question when the project or question index changes
    if (questionIndex !== undefined && question !== (projectData?.questions[questionIndex]?.question || '')) {
        setQuestion(projectData?.questions[questionIndex]?.question || '');
    }

    if (!projectData || questionIndex === undefined) {
        return null;
    }

    const onUpdateQuestion = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const newQuestions = [...projectData.questions];
        newQuestions[questionIndex] = { ...newQuestions[questionIndex], question };
        setProjectData({ ...projectData, questions: newQuestions });
        router.push('/create/2-questions');
    };

    return (
        <Container paddingBottom="xl">
            <ThemeBreadcrumbs themeId={projectData.themeId}></ThemeBreadcrumbs>
            <Steps activeStep={1} themeId={projectData.themeId}></Steps>
            <Title color="primary" marginY="md" variant="h1">
                <Inverted isRound>2</Inverted>{' '}
                {t.rich('Mes <inverted>séquences</inverted>', {
                    inverted: (chunks) => <Inverted>{chunks}</Inverted>,
                })}
            </Title>
            <Form onSubmit={onUpdateQuestion}>
                <Field
                    name="question"
                    label={
                        <Title color="inherit" variant="h2">
                            {t('Modifier une séquence :')}
                        </Title>
                    }
                    input={
                        <Input
                            marginTop="sm"
                            value={question}
                            onChange={(event) => {
                                setQuestion(event.target.value.slice(0, 280));
                            }}
                            required
                            id="question"
                            placeholder={t('Ma séquence')}
                            isFullWidth
                            color="secondary"
                            autoComplete="off"
                        />
                    }
                    helperText={`${question.length}/280`}
                />
                <NextButton backHref="/create/2-questions" type="submit" />
            </Form>
        </Container>
    );
}
