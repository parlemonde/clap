'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';
import type { ServerPageProps } from 'src/lib/page-props.types';

import { FeedbackForm } from '@frontend/components/collaboration/FeedbackForm';
import { FeedbackModal } from '@frontend/components/collaboration/FeedbackModal';
import { Container } from '@frontend/components/layout/Container';
import { Flex } from '@frontend/components/layout/Flex';
import { Title } from '@frontend/components/layout/Typography';
import { Steps } from '@frontend/components/navigation/Steps';
import { ThemeBreadcrumbs } from '@frontend/components/navigation/ThemeBreadcrumbs';
import { Inverted } from '@frontend/components/ui/Inverted';
import { useTranslation } from '@frontend/contexts/translationContext';
import { userContext } from '@frontend/contexts/userContext';
import { useCollaboration } from '@frontend/hooks/useCollaboration';
import { useCurrentProject } from '@frontend/hooks/useCurrentProject';

import type { Sequence } from '@server/database/schemas/projects';

import { MontageForm } from './MontageForm';

export default function MontagePage(props: ServerPageProps) {
    const router = useRouter();
    const { user } = React.useContext(userContext);
    const isStudent = user?.role === 'student';
    const { t } = useTranslation();
    const { projectData, setProjectData } = useCurrentProject();
    const { isCollaborationEnabled, sendCollaborationValidationMsg } = useCollaboration(); // Listen to collaboration updates

    const searchParams = React.use(props.searchParams);
    const questionIndex = typeof searchParams.question === 'string' ? Number(searchParams.question) : undefined;
    const [newQuestion, setNewQuestion] = React.useState<Sequence | null>(null);

    if (!projectData || questionIndex === undefined || !projectData.questions[questionIndex]) {
        return null;
    }

    const sequence = projectData.questions[questionIndex];

    return (
        <Container paddingBottom="xl">
            <ThemeBreadcrumbs themeId={projectData.themeId}></ThemeBreadcrumbs>
            <Steps activeStep={3} themeId={projectData.themeId} backHref="/create/4-pre-mounting"></Steps>
            <Flex flexDirection="row" alignItems="center" isFullWidth marginY="md">
                <Title color="primary" variant="h1">
                    <Inverted isRound>4</Inverted>
                    {t('4_edit_pre_mounting_page.header.title', { number: questionIndex + 1 })}
                </Title>
                {isStudent && sequence.status === 'pre-mounting' && <FeedbackModal question={sequence} />}
            </Flex>
            <Title variant="h2" color="inherit" marginBottom="md">
                {t('4_edit_pre_mounting_page.secondary.title')}
            </Title>
            <MontageForm
                sequence={newQuestion || sequence}
                setSequence={setNewQuestion}
                onSubmit={(newSequence) => {
                    const newQuestions = [...projectData.questions];
                    newQuestions[questionIndex] = newSequence;
                    setProjectData({ ...projectData, questions: newQuestions });
                    router.push('/create/4-pre-mounting');
                }}
                feedbackForm={
                    isCollaborationEnabled && sequence.status === 'pre-mounting-validating' && !isStudent ? (
                        <FeedbackForm
                            question={sequence}
                            onUpdateSequence={(newSequence) => {
                                const newStatus = newSequence.status;
                                sendCollaborationValidationMsg?.({
                                    status: newStatus,
                                    questionId: sequence.id,
                                    studentKind: 'feedback',
                                });
                                const newQuestions = projectData.questions.map<Sequence>((q) => (q.id === newSequence.id ? newSequence : q));
                                setProjectData({ ...projectData, questions: newQuestions });
                            }}
                        />
                    ) : null
                }
            />
        </Container>
    );
}
