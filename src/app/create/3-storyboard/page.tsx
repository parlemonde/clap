'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { Scenario } from './Scenario';
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

export default function StoryboardPage() {
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

    return (
        <Container paddingBottom="xl">
            <ThemeBreadcrumbs themeId={project.themeId}></ThemeBreadcrumbs>
            <Steps activeStep={2} themeId={project.themeId}></Steps>
            <Flex flexDirection="row" alignItems="center" marginY="md">
                <Title color="primary" variant="h1" marginRight="xl">
                    <Inverted isRound>3</Inverted>{' '}
                    <Trans i18nKey="part3_title">
                        Création du <Inverted>Storyboard</Inverted>
                    </Trans>
                </Title>
                {!isStudent && collaborationButton}
            </Flex>
            <Title color="inherit" variant="h2">
                {t('part3_desc')}
            </Title>
            {filteredQuestions.map((sequence) => (
                <Scenario
                    key={sequence.id}
                    sequence={sequence}
                    sequenceIndex={questionIndexMap[sequence.id]}
                    planStartIndex={startIndexPerSequence[questionIndexMap[sequence.id]] || 0}
                    onUpdateSequence={(newSequence: Sequence) => {
                        const newQuestions = [...project.questions];
                        newQuestions[questionIndexMap[sequence.id]] = newSequence;
                        setProject({ ...project, questions: newQuestions });
                    }}
                    collaborationStatus={
                        isCollaborationEnabled
                            ? {
                                  color: COLORS[questionIndexMap[sequence.id]],
                                  status: isStudent ? undefined : getStatus(sequence.status),
                              }
                            : undefined
                    }
                    isCollaborationEnabled={isCollaborationEnabled}
                    sendCollaborationValidationMsg={(status) => {
                        sendCollaborationValidationMsg({
                            questionId: sequence.id,
                            status,
                            studentKind: status === 'storyboard-validating' ? 'feedback' : 'validated',
                        });
                    }}
                    isStudent={isStudent}
                />
            ))}
            <NextButton
                isDisabled={studentQuestion?.status === 'storyboard-validating'}
                label={
                    studentQuestion?.status === 'storyboard-validating'
                        ? 'En attente de validation du storyboard'
                        : isStudent && (!studentQuestion?.status || studentQuestion?.status === 'storyboard')
                          ? 'Envoyer pour vérification'
                          : undefined
                }
                onNext={() => {
                    if (
                        isStudent &&
                        (!studentQuestion?.status || studentQuestion?.status === 'storyboard-validating' || studentQuestion?.status === 'storyboard')
                    ) {
                        if (!studentQuestion) {
                            return;
                        }
                        const newQuestions = project.questions.map<Sequence>((q) =>
                            q.id === studentQuestion.id ? { ...q, status: 'storyboard-validating' } : q,
                        );
                        setProject({ ...project, questions: newQuestions });
                        sendCollaborationValidationMsg({
                            questionId: studentQuestion.id,
                            status: 'storyboard-validating',
                            studentKind: 'feedback',
                        });
                    } else {
                        router.push('/create/4-pre-mounting');
                    }
                }}
            />
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
