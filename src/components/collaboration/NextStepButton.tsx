import React from 'react';

import { sendToast } from '../ui/Toasts';
import { useUpdateQuestionMutation } from 'src/api/questions/questions.put';
import { NextButton } from 'src/components/navigation/NextButton';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { useSocket } from 'src/hooks/useSocket';
import { useTranslation } from 'src/i18n/useTranslation';
import type { Question, QuestionStatus } from 'types/models/question.type';

interface NextStepButtonProps {
    sequencyId: number;
    newStatus: QuestionStatus;
}

export const NextStepButton: React.FunctionComponent<NextStepButtonProps> = ({ sequencyId, newStatus }: NextStepButtonProps) => {
    const { t } = useTranslation();

    const { project, questions, updateProject } = useCurrentProject();
    const { updateProject: updateProjectSocket, alertTeacher } = useSocket();

    const updateSequenceMutation = useUpdateQuestionMutation();

    const sendToVerif = async () => {
        try {
            const question: Question | undefined = questions.find((q: Question) => q.id === sequencyId);
            if (question !== undefined) {
                const sequencyOrder: number = question.index || 0;
                await updateSequenceMutation.mutateAsync({
                    questionId: sequencyId,
                    status: newStatus,
                });
                // Update projects
                const newQuestions = [...questions];
                newQuestions[question.index] = {
                    ...newQuestions[question.index],
                    status: newStatus,
                };
                const updatedProject = updateProject({ questions: newQuestions });
                if (updatedProject) {
                    updateProjectSocket(updatedProject);
                }

                if (project) {
                    alertTeacher({ projectId: project.id, sequencyId, sequencyOrder, status: newStatus });
                }
            }
        } catch (err) {
            console.error(err);
            sendToast({ message: t('unknown_error'), type: 'error' });
        }
    };

    return <NextButton onNext={sendToVerif} label={t('collaboration_send_to_verif_btn')} />;
};
