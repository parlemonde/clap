'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { PlanForm } from './PlanForm';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { useTranslation } from 'src/contexts/translationContext';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import type { ServerPageProps } from 'src/lib/page-props.types';
import type { Plan } from 'src/lib/project.types';

export default function StoryboardPlanPage(props: ServerPageProps) {
    const router = useRouter();
    const { t } = useTranslation();
    const [project, setProject] = useCurrentProject();

    const searchParams = React.use(props.searchParams);
    const questionIndex = typeof searchParams.question === 'string' ? Number(searchParams.question) : undefined;
    const planIndex = typeof searchParams.plan === 'string' ? Number(searchParams.plan) : undefined;
    const [newPlan, setNewPlan] = React.useState<Plan | null>(null);

    if (
        !project ||
        questionIndex === undefined ||
        !project.questions[questionIndex] ||
        planIndex === undefined ||
        !project.questions[questionIndex].plans[planIndex]
    ) {
        return null;
    }

    const sequence = project.questions[questionIndex];
    const plan = sequence.plans[planIndex];
    const planStartIndex = project.questions.slice(0, questionIndex).reduce<number>((acc, question) => acc + (question.plans || []).length, 1);

    return (
        <Container paddingBottom="xl">
            <ThemeBreadcrumbs themeId={project.themeId}></ThemeBreadcrumbs>
            <Steps activeStep={2} themeId={project.themeId} backHref="/create/3-storyboard"></Steps>
            <Title color="primary" variant="h1" marginY="md">
                <Inverted isRound>3</Inverted> {t('part3_edit_plan')}
            </Title>
            <Title color="inherit" variant="h2">
                <span>{t('part3_question')}</span> {sequence?.question || ''}
            </Title>
            <Title color="inherit" variant="h2" marginY="md">
                <span>{t('part3_plan_number')}</span> {planStartIndex + planIndex}
            </Title>
            <PlanForm
                plan={newPlan || plan}
                setPlan={setNewPlan}
                onSubmit={(submittedPlan) => {
                    const newQuestions = [...project.questions];
                    newQuestions[questionIndex] = {
                        ...sequence,
                        plans: sequence.plans.map((p, index) => {
                            if (index === planIndex) {
                                return submittedPlan;
                            }
                            return p;
                        }),
                    };
                    setProject({ ...project, questions: newQuestions });
                    router.push('/create/3-storyboard');
                }}
            />
        </Container>
    );
}
