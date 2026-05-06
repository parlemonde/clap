'use client';

import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import * as React from 'react';

import { Container } from '@frontend/components/layout/Container';
import { Title } from '@frontend/components/layout/Typography';
import { Steps } from '@frontend/components/navigation/Steps';
import { ThemeBreadcrumbs } from '@frontend/components/navigation/ThemeBreadcrumbs';
import { Inverted } from '@frontend/components/ui/Inverted';
import { userContext } from '@frontend/contexts/userContext';
import { useCollaboration } from '@frontend/hooks/useCollaboration';
import { useCurrentProject } from '@frontend/hooks/useCurrentProject';
import type { ServerPageProps } from '@lib/page-props.types';
import type { Plan } from '@server/database/schemas/projects';

import { PlanForm } from './PlanForm';

export default function StoryboardPlanPage(props: ServerPageProps) {
    const router = useRouter();
    const user = React.useContext(userContext);
    const tx = useExtracted('create.3-storyboard.edit');
    const { projectData, setProjectData } = useCurrentProject();
    useCollaboration(); // Listen to collaboration updates

    const searchParams = React.use(props.searchParams);
    const questionIndex = typeof searchParams.question === 'string' ? Number(searchParams.question) : undefined;
    const planIndex = typeof searchParams.plan === 'string' ? Number(searchParams.plan) : undefined;
    const [newPlan, setNewPlan] = React.useState<Plan | null>(null);

    if (
        !projectData ||
        questionIndex === undefined ||
        !projectData.questions[questionIndex] ||
        planIndex === undefined ||
        !projectData.questions[questionIndex].plans[planIndex]
    ) {
        return null;
    }

    const sequence = projectData.questions[questionIndex];
    if (user?.role === 'student' && sequence.id !== user.questionId) {
        return null;
    }

    const plan = sequence.plans[planIndex];
    const planStartIndex = projectData.questions.slice(0, questionIndex).reduce<number>((acc, question) => acc + (question.plans || []).length, 1);

    return (
        <Container paddingBottom="xl">
            <ThemeBreadcrumbs themeId={projectData.themeId}></ThemeBreadcrumbs>
            <Steps activeStep={2} themeId={projectData.themeId} backHref="/create/3-storyboard"></Steps>
            <Title color="primary" variant="h1" marginY="md">
                <Inverted isRound>3</Inverted> {tx('Créez votre plan')}
            </Title>
            <Title color="inherit" variant="h2">
                {tx('Séquence : {sequenceName}', {
                    sequenceName: sequence?.question || '',
                })}
            </Title>
            <Title color="inherit" variant="h2" marginY="md">
                {tx('Plan numéro : {planNumber}', {
                    planNumber: String(planStartIndex + planIndex),
                })}
            </Title>
            <PlanForm
                plan={newPlan || plan}
                setPlan={setNewPlan}
                onSubmit={(submittedPlan) => {
                    const newQuestions = [...projectData.questions];
                    newQuestions[questionIndex] = {
                        ...sequence,
                        plans: sequence.plans.map((p, index) => {
                            if (index === planIndex) {
                                return submittedPlan;
                            }
                            return p;
                        }),
                    };
                    setProjectData({ ...projectData, questions: newQuestions });
                    router.push('/create/3-storyboard');
                }}
            />
        </Container>
    );
}
