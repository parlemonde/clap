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
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import type { ServerPageProps } from 'src/lib/page-props.types';

export default function ScenarioPage(props: ServerPageProps) {
    const router = useRouter();
    const { project, setProject } = useCurrentProject();
    const { t } = useTranslation();

    const searchParams = React.use(props.searchParams);
    const questionIndex = typeof searchParams.question === 'string' ? Number(searchParams.question) : undefined;

    const [question, setQuestion] = React.useState(questionIndex ? project?.questions[questionIndex]?.question || '' : '');

    // Update the question when the project or question index changes
    React.useEffect(() => {
        if (questionIndex === undefined) {
            return;
        }
        setQuestion(project?.questions[questionIndex]?.question || '');
    }, [questionIndex, project]);

    if (!project || questionIndex === undefined) {
        return null;
    }

    const onUpdateQuestion = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const newQuestions = [...project.questions];
        newQuestions[questionIndex] = { ...newQuestions[questionIndex], question };
        setProject({ ...project, questions: newQuestions });
        router.push('/create/2-questions');
    };

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
            <Form onSubmit={onUpdateQuestion}>
                <Field
                    name="question"
                    label={
                        <Title color="inherit" variant="h2">
                            {t('part2_edit_question')}
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
                            placeholder={t('part2_add_question_placeholder')}
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
