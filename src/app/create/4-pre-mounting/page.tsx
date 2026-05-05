'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import * as React from 'react';

import { FeedbackModal } from '@frontend/components/collaboration/FeedbackModal';
import { GroupColorPill } from '@frontend/components/collaboration/GroupColorPill';
import { getStatus } from '@frontend/components/collaboration/get-status';
import { DiaporamaCard } from '@frontend/components/create/DiaporamaCard';
import { Container } from '@frontend/components/layout/Container';
import { Flex } from '@frontend/components/layout/Flex';
import { Title } from '@frontend/components/layout/Typography';
import { NextButton } from '@frontend/components/navigation/NextButton';
import { Steps } from '@frontend/components/navigation/Steps';
import { ThemeBreadcrumbs } from '@frontend/components/navigation/ThemeBreadcrumbs';
import { Inverted } from '@frontend/components/ui/Inverted';
import { userContext } from '@frontend/contexts/userContext';
import { useCollaboration } from '@frontend/hooks/useCollaboration';
import { useCurrentProject } from '@frontend/hooks/useCurrentProject';
import { COLORS } from '@frontend/lib/colors';
import type { Sequence } from '@server/database/schemas/projects';

export default function PreMountingPage() {
    const router = useRouter();
    const t = useTranslations();
    const { projectData, setProjectData } = useCurrentProject();
    const { collaborationButton, isCollaborationEnabled, sendCollaborationValidationMsg } = useCollaboration();
    const user = React.useContext(userContext);
    const isStudent = user?.role === 'student';

    if (!projectData) {
        return null;
    }

    const startIndexPerSequence: Partial<Record<number, number>> = {};
    projectData.questions.reduce<number>((acc, sequence, index) => {
        startIndexPerSequence[index] = acc;
        return acc + (sequence.plans || []).length;
    }, 1);

    const questionIndexMap = Object.fromEntries(projectData.questions.map((q, index) => [q.id, index]));
    const studentQuestion = isStudent && user?.questionId !== undefined ? projectData.questions.find((q) => q.id === user.questionId) : null;
    const filteredQuestions = isStudent ? (studentQuestion ? [studentQuestion] : []) : projectData.questions;

    const canEdit = !isStudent || (isStudent && studentQuestion?.status === 'pre-mounting');

    return (
        <Container paddingBottom="xl">
            <ThemeBreadcrumbs themeId={projectData.themeId}></ThemeBreadcrumbs>
            <Steps activeStep={3} themeId={projectData.themeId}></Steps>
            <Flex flexDirection="row" alignItems="center" marginY="md">
                <Title color="primary" variant="h1" marginRight="xl">
                    <Inverted isRound>4</Inverted>{' '}
                    {t.rich('4_pre_mounting_page.header.title', {
                        inverted: (chunks) => <Inverted>{chunks}</Inverted>,
                    })}
                </Title>
                {!isStudent && collaborationButton}
            </Flex>
            <Title color="inherit" variant="h2">
                {t('4_pre_mounting_page.secondary.title')}
            </Title>
            {filteredQuestions.map((q) => {
                const hasBeenEdited = q.title !== undefined || (q.plans || []).some((plan) => plan.description || plan.imageUrl);
                const index = questionIndexMap[q.id];
                return (
                    <div key={index}>
                        <Flex flexDirection="row" isFullWidth marginTop="lg" alignItems="center">
                            <Title color="primary" variant="h2" id={`sequence-${index}`} paddingTop={80} marginTop={-80}>
                                {index + 1}. {q.question}
                            </Title>
                            {isCollaborationEnabled && <GroupColorPill color={COLORS[index]} status={isStudent ? undefined : getStatus(q.status)} />}
                            {isStudent && q.status === 'pre-mounting' && <FeedbackModal question={q} />}
                        </Flex>
                        {hasBeenEdited ? (
                            <div className="plans">
                                <DiaporamaCard sequence={q} questionIndex={index} isDisabled={!canEdit} />
                            </div>
                        ) : (
                            <p style={{ marginTop: '1rem' }}>{t('4_pre_mounting_page.not_edited.placeholder')}</p>
                        )}
                    </div>
                );
            })}
            {(!isStudent || studentQuestion?.status !== 'validated') && (
                <NextButton
                    label={
                        isStudent && studentQuestion?.status === 'pre-mounting-validating'
                            ? t('4_pre_mounting_page.collaboration.awaiting_validation')
                            : isStudent
                              ? t('4_pre_mounting_page.collaboration.send_for_validation')
                              : undefined
                    }
                    isDisabled={isStudent && studentQuestion?.status !== 'pre-mounting'}
                    onNext={() => {
                        if (isStudent) {
                            if (!studentQuestion) {
                                return;
                            }
                            const newQuestions = projectData.questions.map<Sequence>((q) =>
                                q.id === studentQuestion.id ? { ...q, status: 'pre-mounting-validating' } : q,
                            );
                            setProjectData({ ...projectData, questions: newQuestions });
                            sendCollaborationValidationMsg({
                                questionId: studentQuestion.id,
                                status: 'pre-mounting-validating',
                            });
                        } else {
                            router.push('/create/5-music');
                        }
                    }}
                />
            )}
        </Container>
    );
}
