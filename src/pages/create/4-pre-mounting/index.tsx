import { useRouter } from 'next/router';
import React from 'react';

import { useScenario } from 'src/api/scenarios/scenarios.get';
import { useTheme } from 'src/api/themes/themes.get';
import { ButtonShowFeedback } from 'src/components/collaboration/ButtonShowFeedback';
import { FeedbackModal } from 'src/components/collaboration/FeedbackModal';
import { GroupColorPill } from 'src/components/collaboration/GroupColorPill';
import { NextStepButton } from 'src/components/collaboration/NextStepButton';
import { DiaporamaCard } from 'src/components/create/DiaporamaCard';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import { NextButton } from 'src/components/navigation/NextButton';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';
import { userContext } from 'src/contexts/userContext';
import { useCollaboration } from 'src/hooks/useCollaboration';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { useSocket } from 'src/hooks/useSocket';
import { useTranslation } from 'src/i18n/useTranslation';
import { COLORS } from 'src/utils/colors';
import { getFromLocalStorage } from 'src/utils/local-storage';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';
import { QuestionStatus, type Question } from 'types/models/question.type';
import { UserType } from 'types/models/user.type';

const PreMountingPage = () => {
    const router = useRouter();
    const { t, currentLocale } = useTranslation();
    const { project, questions, isLoading: isProjectLoading } = useCurrentProject();
    const { theme, isLoading: isThemeLoading } = useTheme(project ? project.themeId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });
    const { scenario } = useScenario(project ? project.scenarioId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });

    const { isCollaborationActive } = useCollaboration();
    const { socket, connectStudent, connectTeacher } = useSocket();

    const [showFeedback, setShowFeedback] = React.useState(false);
    const [studentQuestion, setStudentQuestion] = React.useState(null);

    const { user } = React.useContext(userContext);
    const isStudent = user?.type === UserType.STUDENT;
    const sequencyId = isStudent ? getFromLocalStorage('student', undefined)?.sequencyId || null : null;

    React.useEffect(() => {
        if (isCollaborationActive && socket.connected === false && project !== undefined && project.id) {
            if (isStudent && sequencyId) {
                connectStudent(project.id, sequencyId);
            } else if (!isStudent) {
                connectTeacher(project);
            }
        }
    }, [isCollaborationActive, socket, project, isStudent, sequencyId]);

    React.useEffect(() => {
        const question: Question | undefined = questions.find((q: Question) => q.id === sequencyId);
        if (question) {
            setStudentQuestion(question);
        }
    }, [questions, sequencyId]);

    return (
        <Container>
            {!isStudent ? <ThemeBreadcrumbs theme={theme} isLoading={isThemeLoading}></ThemeBreadcrumbs> : <div style={{ marginTop: '10px' }}></div>}
            <Steps
                activeStep={3}
                themeId={project ? project.themeId : undefined}
                scenarioName={scenario?.names?.[currentLocale] || undefined}
            ></Steps>
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '2rem' }}>
                <Title color="primary" variant="h1" marginY="md">
                    <Inverted isRound>4</Inverted>{' '}
                    <Trans i18nKey="part4_title">
                        Création du <Inverted>Storyboard</Inverted>
                    </Trans>
                </Title>
                <Title color="inherit" variant="h2">
                    {t('part4_subtitle1')}
                </Title>
                {questions.map((q, index) => {
                    if (isStudent && sequencyId !== q.id) return null;
                    const hasBeenEdited = q.title !== null || (q.plans || []).some((plan) => plan.description || plan.imageUrl);
                    return (
                        <div key={index}>
                            <Title color="primary" variant="h2" marginTop="lg" style={{ marginTop: '2rem', display: 'flex', alignItems: 'center' }}>
                                {index + 1}. {q.question}
                                {isCollaborationActive && <GroupColorPill color={COLORS[index]} />}
                                {isStudent && q.id === sequencyId && q.feedback && <ButtonShowFeedback onClick={() => setShowFeedback(true)} />}
                            </Title>
                            {hasBeenEdited ? (
                                <div className="plans">
                                    <DiaporamaCard
                                        projectId={project?.id || null}
                                        sequence={q}
                                        questionIndex={index}
                                        isAuthorized={q.status === QuestionStatus.PREMOUNTING || !isStudent}
                                    />
                                </div>
                            ) : (
                                <p>{t('part4_placeholder')}</p>
                            )}
                            <FeedbackModal
                                isOpen={showFeedback}
                                onClose={() => setShowFeedback(false)}
                                feedback={q && q.feedback ? q.feedback : ''}
                            />
                        </div>
                    );
                })}
                {isStudent && studentQuestion && studentQuestion.status === QuestionStatus.PREMOUNTING && (
                    <NextStepButton sequencyId={sequencyId} newStatus={QuestionStatus.SUBMITTED} />
                )}
                {!isStudent && (
                    <NextButton
                        onNext={() => {
                            router.push(`/create/5-music${serializeToQueryUrl({ projectId: project?.id || null })}`);
                        }}
                    />
                )}
            </div>
        </Container>
    );
};

export default PreMountingPage;
