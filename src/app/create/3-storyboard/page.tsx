'use client';

import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import * as React from 'react';

import { getStatus } from '@frontend/components/collaboration/get-status';
import { Button } from '@frontend/components/layout/Button';
import { Container } from '@frontend/components/layout/Container';
import { Flex } from '@frontend/components/layout/Flex';
import { Title } from '@frontend/components/layout/Typography';
import { NextButton } from '@frontend/components/navigation/NextButton';
import { Steps } from '@frontend/components/navigation/Steps';
import { ThemeBreadcrumbs } from '@frontend/components/navigation/ThemeBreadcrumbs';
import { Inverted } from '@frontend/components/ui/Inverted';
import { Loader } from '@frontend/components/ui/Loader';
import { sendToast } from '@frontend/components/ui/Toasts';
import { userContext } from '@frontend/contexts/userContext';
import { useCollaboration } from '@frontend/hooks/useCollaboration';
import { useCurrentProject } from '@frontend/hooks/useCurrentProject';
import { COLORS } from '@frontend/lib/colors';
import PictureAsPdf from '@frontend/svg/pdf.svg';
import type { Sequence } from '@server/database/schemas/projects';
import { generatePdf } from '@server-actions/projects/generate-pdf';

import { Scenario } from './Scenario';

export default function StoryboardPage() {
    const router = useRouter();

    const t = useExtracted('create.3-storyboard');
    const commonT = useExtracted('common');
    const { projectData, setProjectData } = useCurrentProject();
    const { collaborationButton, isCollaborationEnabled, sendCollaborationValidationMsg } = useCollaboration();
    const user = React.useContext(userContext);
    const isStudent = user?.role === 'student';
    const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);

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

    const onGeneratePDF = async () => {
        setIsGeneratingPDF(true);
        // Open immediately a new tab to avoid the browser blocking the new window
        const newWindow = window.open('/create/3-storyboard/generating-pdf', '_blank');
        try {
            const url = await generatePdf(projectData);
            if (url && newWindow) {
                newWindow.location = url;
                newWindow.focus();
            } else if (url && !newWindow) {
                // download the pdf, the newWindow is blocked by the browser
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Plan-de-tournage.pdf';
                a.click();
            } else {
                sendToast({
                    message: commonT('Une erreur est survenue...'),
                    type: 'error',
                });
                newWindow?.close();
            }
        } catch (e) {
            sendToast({
                message: commonT('Une erreur est survenue...'),
                type: 'error',
            });
            newWindow?.close();
            console.error(e);
        }
        setIsGeneratingPDF(false);
    };

    return (
        <Container paddingBottom="xl">
            <ThemeBreadcrumbs themeId={projectData.themeId}></ThemeBreadcrumbs>
            <Steps activeStep={2} themeId={projectData.themeId}></Steps>
            <Flex flexDirection="row" alignItems="center" marginY="md">
                <Title color="primary" variant="h1" marginRight="xl">
                    <Inverted isRound>3</Inverted>{' '}
                    {t.rich('Création du <inverted>Storyboard</inverted>', {
                        inverted: (chunks) => <Inverted>{chunks}</Inverted>,
                    })}
                </Title>
                {!isStudent && collaborationButton}
            </Flex>
            <Title color="inherit" variant="h2">
                {t(
                    "Ici créez votre storyboard ! C'est une représentation de votre film sous forme de dessins et le résultat final de votre vidéo sera l'assemblage de ces plans les uns après les autres.\n",
                )}
            </Title>
            {filteredQuestions.map((sequence) => (
                <Scenario
                    key={sequence.id}
                    sequence={sequence}
                    sequenceIndex={questionIndexMap[sequence.id]}
                    planStartIndex={startIndexPerSequence[questionIndexMap[sequence.id]] || 0}
                    onUpdateSequence={(newSequence: Sequence) => {
                        const newQuestions = [...projectData.questions];
                        newQuestions[questionIndexMap[sequence.id]] = newSequence;
                        setProjectData({ ...projectData, questions: newQuestions });
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
            {!isStudent && (
                <div style={{ margin: '32px 0' }}>
                    <Button
                        label={t('Télécharger le storyboard')}
                        leftIcon={<PictureAsPdf style={{ marginRight: '10px' }} />}
                        variant="outlined"
                        color="secondary"
                        onClick={onGeneratePDF}
                        marginRight="md"
                    ></Button>
                </div>
            )}
            <NextButton
                isDisabled={studentQuestion?.status === 'storyboard-validating'}
                label={
                    studentQuestion?.status === 'storyboard-validating'
                        ? t('En attente de validation du storyboard')
                        : isStudent && (!studentQuestion?.status || studentQuestion?.status === 'storyboard')
                          ? t('Envoyer pour vérification')
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
                        const newQuestions = projectData.questions.map<Sequence>((q) =>
                            q.id === studentQuestion.id ? { ...q, status: 'storyboard-validating' } : q,
                        );
                        setProjectData({ ...projectData, questions: newQuestions });
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
            <Loader isLoading={isGeneratingPDF}></Loader>
        </Container>
    );
}
