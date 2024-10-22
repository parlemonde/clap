'use client';

import React from 'react';

import { QuestionsList } from './QuestionsList';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';
import { useTranslation } from 'src/contexts/translationContext';
import type { QuestionTemplate } from 'src/database/schemas/question-template';
import { useCurrentProject } from 'src/hooks/useCurrentProject';

interface PageWithProjectProps {
    themeId: string | number;
    scenarioId: string | number;
    defaultQuestions: QuestionTemplate[];
}

export const PageWithProject = ({ themeId, scenarioId, defaultQuestions }: PageWithProjectProps) => {
    const { t } = useTranslation();
    const [project, setProject, isLoadingProject] = useCurrentProject();

    if (!isLoadingProject && !project && themeId && scenarioId) {
        setProject({
            id: '',
            name: '',
            themeId,
            scenarioId,
            questions: defaultQuestions.map((question, index) => ({
                id: index,
                question: question.question,
            })),
        });
    }

    if (!project) {
        return null;
    }

    return (
        <Container paddingBottom="xl">
            <ThemeBreadcrumbs themeId={project.themeId}></ThemeBreadcrumbs>
            <Steps activeStep={1} themeId={project.themeId} scenarioName={'FOO'}></Steps>
            <Title color="primary" marginY="md" variant="h1">
                <Inverted isRound>2</Inverted>{' '}
                <Trans i18nKey="part2_title">
                    Mes <Inverted>séquences</Inverted>
                </Trans>
            </Title>
            <Title color="inherit" variant="h2">
                {t('part2_desc')}
            </Title>
            <QuestionsList project={project} setProject={setProject} />
        </Container>
    );
};
