'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { MontageForm } from './MontageForm';
import { FeedbackForm } from 'src/components/collaboration/FeedbackForm';
import { FeedbackModal } from 'src/components/collaboration/FeedbackModal';
import { Container } from 'src/components/layout/Container';
import { Flex } from 'src/components/layout/Flex';
import { Title } from 'src/components/layout/Typography';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { useTranslation } from 'src/contexts/translationContext';
import { userContext } from 'src/contexts/userContext';
import { useCollaboration } from 'src/hooks/useCollaboration';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import type { ServerPageProps } from 'src/lib/page-props.types';
import type { Sequence } from 'src/lib/project.types';

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
                    {t('pre_mount_title', { number: questionIndex + 1 })}
                </Title>
                {isStudent && sequence.status === 'pre-mounting' && <FeedbackModal question={sequence} />}
            </Flex>
            <Title variant="h2" color="inherit" marginBottom="md">
                {t('pre_mount_title_desc')}
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
