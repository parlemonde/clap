'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { FeedbackForm } from 'src/components/collaboration/FeedbackForm';
import { GroupColorPill } from 'src/components/collaboration/GroupColorPill';
import { DiaporamaCard } from 'src/components/create/DiaporamaCard';
import { Container } from 'src/components/layout/Container';
import { Flex } from 'src/components/layout/Flex';
import { Title } from 'src/components/layout/Typography';
import { NextButton } from 'src/components/navigation/NextButton';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';
import { useTranslation } from 'src/contexts/translationContext';
import { userContext } from 'src/contexts/userContext';
import { useCollaboration } from 'src/hooks/useCollaboration';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { COLORS } from 'src/lib/colors';
import type { Sequence } from 'src/lib/project.types';

export default function PreMountingPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const { project, setProject } = useCurrentProject();
    const { collaborationButton, isCollaborationEnabled, sendCollaborationValidationMsg } = useCollaboration();
    const { user } = React.useContext(userContext);
    const isStudent = user?.role === 'student';

    if (!project) {
        return null;
    }

    const startIndexPerSequence: Partial<Record<number, number>> = {};
    project.questions.reduce<number>((acc, sequence, index) => {
        startIndexPerSequence[index] = acc;
        return acc + (sequence.plans || []).length;
    }, 1);

    const questionIndexMap = Object.fromEntries(project.questions.map((q, index) => [q.id, index]));
    const studentQuestion = isStudent && user?.questionId !== undefined ? project.questions.find((q) => q.id === user.questionId) : null;
    const filteredQuestions = isStudent ? (studentQuestion ? [studentQuestion] : []) : project.questions;

    const canEdit = !isStudent || (isStudent && studentQuestion?.status === 'pre-mounting');

    return (
        <Container paddingBottom="xl">
            <ThemeBreadcrumbs themeId={project.themeId}></ThemeBreadcrumbs>
            <Steps activeStep={3} themeId={project.themeId}></Steps>
            <Flex flexDirection="row" alignItems="center" marginY="md">
                <Title color="primary" variant="h1" marginRight="xl">
                    <Inverted isRound>4</Inverted>{' '}
                    <Trans i18nKey="part4_title">
                        Prémontez votre <Inverted>film</Inverted>
                    </Trans>
                </Title>
                {!isStudent && collaborationButton}
            </Flex>
            <Title color="inherit" variant="h2">
                {t('part4_subtitle1')}
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
                        </Flex>
                        {hasBeenEdited ? (
                            <div className="plans">
                                <DiaporamaCard sequence={q} questionIndex={index} isDisabled={!canEdit} />
                            </div>
                        ) : (
                            <p style={{ marginTop: '1rem' }}>{t('part4_placeholder')}</p>
                        )}
                        {isCollaborationEnabled && q.status === 'pre-mounting-validating' && !isStudent ? (
                            <FeedbackForm
                                question={q}
                                onUpdateSequence={(newSequence) => {
                                    const newStatus = newSequence.status;
                                    sendCollaborationValidationMsg?.({
                                        status: newStatus,
                                        questionId: q.id,
                                        studentKind: 'feedback',
                                    });
                                    const newQuestions = project.questions.map<Sequence>((q) => (q.id === newSequence.id ? newSequence : q));
                                    setProject({ ...project, questions: newQuestions });
                                }}
                            />
                        ) : null}
                    </div>
                );
            })}
            {!isStudent ||
                (studentQuestion?.status !== 'validated' && (
                    <NextButton
                        label={
                            isStudent && studentQuestion?.status === 'pre-mounting-validating'
                                ? 'En attente de validation du prémontage'
                                : isStudent
                                  ? 'Envoyer pour vérification'
                                  : undefined
                        }
                        isDisabled={isStudent && studentQuestion?.status !== 'pre-mounting'}
                        onNext={() => {
                            if (isStudent) {
                                if (!studentQuestion) {
                                    return;
                                }
                                const newQuestions = project.questions.map<Sequence>((q) =>
                                    q.id === studentQuestion.id ? { ...q, status: 'pre-mounting-validating' } : q,
                                );
                                setProject({ ...project, questions: newQuestions });
                                sendCollaborationValidationMsg({
                                    questionId: studentQuestion.id,
                                    status: 'pre-mounting-validating',
                                });
                            } else {
                                router.push('/create/5-music');
                            }
                        }}
                    />
                ))}
        </Container>
    );
}

function getStatus(status: Sequence['status']) {
    if (!status || status === 'storyboard') {
        return 'Storyboard en cours';
    }
    if (status === 'storyboard-validating') {
        return 'En attente de validation du storyboard';
    }
    if (status === 'pre-mounting') {
        return 'Prémontage en cours';
    }
    if (status === 'pre-mounting-validating') {
        return 'En attente de validation du prémontage';
    }
    if (status === 'validated') {
        return 'Terminé';
    }
}
