'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { Scenario } from './Scenario';
import { generatePdf } from 'src/actions/projects/generate-pdf';
import { getStatus } from 'src/components/collaboration/get-status';
import { Button } from 'src/components/layout/Button';
import { Container } from 'src/components/layout/Container';
import { Flex } from 'src/components/layout/Flex';
import { Title } from 'src/components/layout/Typography';
import { NextButton } from 'src/components/navigation/NextButton';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { Loader } from 'src/components/ui/Loader';
import { sendToast } from 'src/components/ui/Toasts';
import { Trans } from 'src/components/ui/Trans';
import { useTranslation } from 'src/contexts/translationContext';
import { userContext } from 'src/contexts/userContext';
import type { Sequence } from 'src/database/schemas/projects';
import { useCollaboration } from 'src/hooks/useCollaboration';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { COLORS } from 'src/lib/colors';
import PictureAsPdf from 'src/svg/pdf.svg';

export default function StoryboardPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const { projectData, setProjectData } = useCurrentProject();
    const { collaborationButton, isCollaborationEnabled, sendCollaborationValidationMsg } = useCollaboration();
    const { user } = React.useContext(userContext);
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
                    message: t('common.errors.unknown'),
                    type: 'error',
                });
                newWindow?.close();
            }
        } catch (e) {
            sendToast({
                message: t('common.errors.unknown'),
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
                    <Trans i18nKey="3_storyboard_page.header.title">
                        Création du <Inverted>Storyboard</Inverted>
                    </Trans>
                </Title>
                {!isStudent && collaborationButton}
            </Flex>
            <Title color="inherit" variant="h2">
                {t('3_storyboard_page.secondary.title')}
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
                        label={t('3_storyboard_page.pdf_button.label')}
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
                        ? t('3_storyboard_page.collaboration.awaiting_validation')
                        : isStudent && (!studentQuestion?.status || studentQuestion?.status === 'storyboard')
                          ? t('3_storyboard_page.collaboration.send_for_validation')
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
