import React from 'react';

import { Button } from '../layout/Button';
import { Field, TextArea } from '../layout/Form';
import { sendToast } from '../ui/Toasts';
import { useUpdateQuestionMutation } from 'src/api/questions/questions.put';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { useSocket } from 'src/hooks/useSocket';
import { useTranslation } from 'src/i18n/useTranslation';
import type { Question, QuestionStatus } from 'types/models/question.type';

interface FormFeedbackProps {
    question: Question;
    previousStatus: QuestionStatus;
    nextStatus: QuestionStatus;
}

export const FormFeedback: React.FunctionComponent<FormFeedbackProps> = ({ question, previousStatus, nextStatus }: FormFeedbackProps) => {
    const { t } = useTranslation();

    const { project, questions, updateProject } = useCurrentProject();
    const { updateProject: updateProjectSocket, alertStudent: alertStudentSocket } = useSocket();

    const updateSequenceMutation = useUpdateQuestionMutation();
    const [feedback, setFeedback] = React.useState('');

    const alertStudent = async (question: Question, status: QuestionStatus, checkFeedback: boolean = false) => {
        if (checkFeedback && !feedback) {
            sendToast({ message: t('collaboration_form_feedback_error'), type: 'error' });
            return;
        }

        try {
            const feedbackData = status === previousStatus ? feedback : null;
            await updateSequenceMutation.mutateAsync({
                questionId: question.id,
                status,
                feedback: feedbackData,
            });
            // Update projects
            const newQuestions = [...questions];
            newQuestions[question.index] = {
                ...newQuestions[question.index],
                status,
                feedback: feedbackData,
            };
            const updatedProject = updateProject({ questions: newQuestions });
            if (updatedProject) {
                updateProjectSocket(updatedProject);
            }

            if (project) {
                alertStudentSocket({
                    room: `project-${project.id}_question-${question.id}`,
                    feedback: feedbackData,
                    projectId: project.id,
                    sequencyId: question.index,
                });
            }
        } catch (err) {
            console.error(err);
            sendToast({ message: t('unknown_error'), type: 'error' });
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '20px 30px',
                border: '1px solid #737373',
                marginTop: '15px',
                borderRadius: '5px',
            }}
        >
            <h2
                style={{
                    fontSize: '36px',
                    textAlign: 'center',
                    margin: '0 auto 20px auto',
                    borderBottom: '5px solid #79C3A5',
                }}
                className="title"
            >
                {t('collaboration_form_feedback_title')}
            </h2>

            <Field
                marginTop="sm"
                name="feedback"
                label={<span style={{ fontSize: '14px' }}>{t('collaboration_form_feedback_label')} :</span>}
                input={
                    <TextArea
                        id="feedback"
                        name="feedback"
                        placeholder={t('collaboration_form_feedback_placeholder')}
                        value={feedback}
                        onChange={(event) => setFeedback(event.target.value)}
                        color="secondary"
                        isFullWidth
                    />
                }
            ></Field>
            <div
                style={{
                    margin: 'auto',
                }}
            >
                <Button
                    as="a"
                    variant="contained"
                    color="secondary"
                    style={{
                        textTransform: 'none',
                        marginTop: '2rem',
                        marginLeft: '2rem',
                    }}
                    onClick={() => alertStudent(question, previousStatus, true)}
                    label={t('collaboration_form_feedback_btn_feedback')}
                ></Button>
                <Button
                    as="a"
                    variant="contained"
                    color="secondary"
                    style={{
                        textTransform: 'none',
                        marginTop: '2rem',
                        marginLeft: '2rem',
                    }}
                    onClick={() => alertStudent(question, nextStatus)}
                    label={t('collaboration_form_feedback_btn_ok')}
                ></Button>
            </div>
        </div>
    );
};
