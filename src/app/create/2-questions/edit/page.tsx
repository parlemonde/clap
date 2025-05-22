'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { Container } from 'src/components/layout/Container';
import { Field, Form, Input } from 'src/components/layout/Form';
import { Title } from 'src/components/layout/Typography';
import { NextButton } from 'src/components/navigation/NextButton';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';
import { useTranslation } from 'src/contexts/translationContext';
import { useCollaboration } from 'src/hooks/useCollaboration';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import type { ServerPageProps } from 'src/lib/page-props.types';

export default function ScenarioPage(props: ServerPageProps) {
    const router = useRouter();
    const { projectData, setProjectData } = useCurrentProject();
    useCollaboration(); // Listen to collaboration updates
    const { t } = useTranslation();

    const searchParams = React.use(props.searchParams);
    const questionIndex = typeof searchParams.question === 'string' ? Number(searchParams.question) : undefined;

    const [question, setQuestion] = React.useState(questionIndex ? projectData?.questions[questionIndex]?.question || '' : '');

    // Update the question when the project or question index changes
    React.useEffect(() => {
        if (questionIndex === undefined) {
            return;
        }
        setQuestion(projectData?.questions[questionIndex]?.question || '');
    }, [questionIndex, projectData]);

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
                <Trans i18nKey="2_questions_page.header.title">
                    Mes <Inverted>séquences</Inverted>
                </Trans>
            </Title>
            <Form onSubmit={onUpdateQuestion}>
                <Field
                    name="question"
                    label={
                        <Title color="inherit" variant="h2">
                            {t('2_edit_questions_page.question_field.label')}
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
                            placeholder={t('2_edit_questions_page.question_field.placeholder')}
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
