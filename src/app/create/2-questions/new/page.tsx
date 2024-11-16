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

export default function QuestionNewPage() {
    const router = useRouter();
    const [project, setProject] = useCurrentProject();
    const { t } = useTranslation();

    const [question, setQuestion] = React.useState('');

    if (!project) {
        return null;
    }

    const onCreateQuestion = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const newQuestions = [...project.questions];
        const maxId = Math.max(0, ...newQuestions.map((q) => q.id).filter((id) => !isNaN(id) && Number.isFinite(id)));
        newQuestions.push({ id: maxId + 1, question, plans: [] });
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
            <Form onSubmit={onCreateQuestion}>
                <Field
                    name="question"
                    label={
                        <Title color="inherit" variant="h2">
                            {t('part2_add_question')}
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
