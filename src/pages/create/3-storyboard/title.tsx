import { useRouter } from 'next/router';
import React from 'react';

import { useUpdateQuestionMutation } from 'src/api/questions/questions.put';
import { useScenario } from 'src/api/scenarios/scenarios.get';
import { useTheme } from 'src/api/themes/themes.get';
import { ButtonShowFeedback } from 'src/components/collaboration/ButtonShowFeedback';
import { FeedbackModal } from 'src/components/collaboration/FeedbackModal';
import { TitleCanvas } from 'src/components/create/TitleCanvas';
import { Container } from 'src/components/layout/Container';
import { Title as TitleComponent } from 'src/components/layout/Typography';
import { NextButton } from 'src/components/navigation/NextButton';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { Loader } from 'src/components/ui/Loader';
import { sendToast } from 'src/components/ui/Toasts';
import { userContext } from 'src/contexts/userContext';
import { useCollaboration } from 'src/hooks/useCollaboration';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { useSocket } from 'src/hooks/useSocket';
import { useTranslation } from 'src/i18n/useTranslation';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';
import { useQueryNumber } from 'src/utils/useQueryId';
import { QuestionStatus, type Question } from 'types/models/question.type';
import type { Title } from 'types/models/title.type';
import { UserType } from 'types/models/user.type';

const EMPTY_TITLE: Title = {
    text: '',
    duration: 3000, // 3 seconds
    style: JSON.stringify({
        fontFamily: 'serif',
        fontSize: 8,
        x: 15,
        y: 30,
        width: 70,
    }),
};

const getTitleToEdit = (sequence?: Question) => {
    return JSON.parse(
        JSON.stringify(
            sequence
                ? sequence.title || {
                      ...EMPTY_TITLE,
                      text: sequence.question,
                  }
                : EMPTY_TITLE,
        ),
    );
};

const TitlePlan = () => {
    const router = useRouter();
    const { t, currentLocale } = useTranslation();
    const { project, questions, isLoading: isProjectLoading, updateProject } = useCurrentProject();
    const { theme, isLoading: isThemeLoading } = useTheme(project ? project.themeId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });
    const { scenario } = useScenario(project ? project.scenarioId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });

    const { isCollaborationActive } = useCollaboration();
    const { socket, connectStudent, connectTeacher, updateProject: updateProjectSocket } = useSocket();
    const { user } = React.useContext(userContext);

    const questionIndex = useQueryNumber('question') ?? -1;
    const sequence = React.useMemo(() => (questionIndex !== -1 ? questions[questionIndex] : undefined), [questions, questionIndex]);

    const isStudent = user?.type === UserType.STUDENT;
    const [showButtonFeedback, setShowButtonFeedback] = React.useState(
        (isStudent && sequence && sequence.feedbacks && QuestionStatus.ONGOING === sequence.status) as boolean,
    );
    const [showFeedback, setShowFeedback] = React.useState(false);

    React.useEffect(() => {
        if (isStudent && sequence && sequence.feedbacks && QuestionStatus.ONGOING === sequence.status) {
            setShowButtonFeedback(true);
        }
    }, [isStudent, sequence]);

    React.useEffect(() => {
        if (isCollaborationActive && socket.connected === false && project !== undefined && project.id && questionIndex !== -1) {
            if (isStudent) {
                connectStudent(project.id, questionIndex);
            } else if (!isStudent) {
                connectTeacher(project);
            }
        }
    }, [isCollaborationActive, socket, project, isStudent, questionIndex]);

    const backUrl = `/create/3-storyboard${serializeToQueryUrl({ projectId: project?.id || null })}`;

    React.useEffect(() => {
        if (isStudent && sequence && sequence.status !== QuestionStatus.ONGOING) {
            router.push(backUrl);
        }
        return;
    }, [sequence, isStudent, backUrl, router]);

    const [title, setTitle] = React.useState(getTitleToEdit(sequence));
    React.useEffect(() => {
        setTitle(getTitleToEdit(sequence));
    }, [sequence]);

    const updateQuestionMutation = useUpdateQuestionMutation();
    const onUpdateQuestion = async () => {
        if (project === undefined || questionIndex === -1) {
            return;
        }
        if (project.id !== 0) {
            try {
                await updateQuestionMutation.mutateAsync({
                    questionId: questions[questionIndex].id,
                    title,
                });
            } catch (err) {
                console.error(err);
                sendToast({ message: t('unknown_error'), type: 'error' });
                return;
            }
        }
        const newQuestions = [...questions];
        newQuestions[questionIndex] = {
            ...newQuestions[questionIndex],
            title,
        };
        const updatedProject = updateProject({
            questions: newQuestions,
        });
        if (isCollaborationActive && updatedProject) {
            updateProjectSocket(updatedProject);
        }
        router.push(backUrl);
    };

    return (
        <Container>
            <ThemeBreadcrumbs theme={theme} isLoading={isThemeLoading}></ThemeBreadcrumbs>
            <Steps
                activeStep={2}
                themeId={project ? project.themeId : undefined}
                scenarioName={scenario?.names?.[currentLocale] || undefined}
                backHref={backUrl}
            ></Steps>
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '2rem' }}>
                <TitleComponent color="primary" variant="h1" marginY="md">
                    <Inverted isRound>3</Inverted> {t('part3_edit_title', { planNumber: questionIndex + 1 })}
                    {showButtonFeedback && <ButtonShowFeedback onClick={() => setShowFeedback(true)} />}
                </TitleComponent>
                <TitleComponent color="inherit" variant="h2">
                    <span>{t('part3_question')}</span> {sequence?.question || ''}
                </TitleComponent>
                <TitleComponent color="inherit" variant="h2" marginY="md">
                    <span>{t('part3_edit_title_desc')}</span>
                </TitleComponent>

                {title !== null && <TitleCanvas title={title} onChange={setTitle} />}

                <NextButton label={t('continue')} backHref={backUrl} onNext={onUpdateQuestion} />
            </div>
            <Loader isLoading={updateQuestionMutation.isLoading} />
            <FeedbackModal
                isOpen={showFeedback}
                onClose={() => setShowFeedback(false)}
                feedback={sequence && sequence.feedbacks && sequence.feedbacks.length > 0 ? sequence.feedbacks[sequence.feedbacks.length - 1] : ''}
            />
        </Container>
    );
};

export default TitlePlan;
