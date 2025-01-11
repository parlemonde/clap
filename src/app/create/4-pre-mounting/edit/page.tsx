'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { MontageForm } from './MontageForm';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { useTranslation } from 'src/contexts/translationContext';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import type { ServerPageProps } from 'src/lib/page-props.types';
import type { Sequence } from 'src/lib/project.types';

export default function MontagePage(props: ServerPageProps) {
    const router = useRouter();
    const { t } = useTranslation();
    const [project, setProject] = useCurrentProject();

    const searchParams = React.use(props.searchParams);
    const questionIndex = typeof searchParams.question === 'string' ? Number(searchParams.question) : undefined;
    const [newQuestion, setNewQuestion] = React.useState<Sequence | null>(null);

    if (!project || questionIndex === undefined || !project.questions[questionIndex]) {
        return null;
    }

    const sequence = project.questions[questionIndex];

    return (
        <Container paddingBottom="xl">
            <ThemeBreadcrumbs themeId={project.themeId}></ThemeBreadcrumbs>
            <Steps activeStep={3} themeId={project.themeId} backHref="/create/4-pre-mounting"></Steps>
            <Title color="primary" variant="h1" marginY="md">
                <Inverted isRound>4</Inverted>
                {t('pre_mount_title', { number: questionIndex + 1 })}
            </Title>
            <Title variant="h2" color="inherit" marginBottom="md">
                {t('pre_mount_title_desc')}
            </Title>
            <MontageForm
                sequence={newQuestion || sequence}
                setSequence={setNewQuestion}
                onSubmit={(newSequence) => {
                    const newQuestions = [...project.questions];
                    newQuestions[questionIndex] = newSequence;
                    setProject({ ...project, questions: newQuestions });
                    router.push('/create/4-pre-mounting');
                }}
            />
        </Container>
    );
}
