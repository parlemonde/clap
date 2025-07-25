import React from 'react';

import { QuestionCard } from 'src/components/create/QuestionCard';
import { Modal } from 'src/components/layout/Modal';
import { Sortable } from 'src/components/ui/Sortable';
import { useTranslation } from 'src/contexts/translationContext';
import type { ProjectData, Sequence } from 'src/database/schemas/projects';

interface QuestionsListProps {
    project: ProjectData;
    setProject: (newProject: ProjectData) => void;
}

export const QuestionsList = ({ project, setProject }: QuestionsListProps) => {
    const { t } = useTranslation();
    const questions = project.questions;
    const [deleteQuestionIndex, setDeleteQuestionIndex] = React.useState(-1);

    const setQuestionsOrder = (newQuestions: Sequence[]) => {
        setProject({ ...project, questions: newQuestions });
    };

    return (
        <>
            <Sortable list={project.questions} setList={setQuestionsOrder}>
                {questions.map((question, index) => (
                    <QuestionCard
                        key={question.id}
                        projectId={null}
                        question={question.question}
                        index={index}
                        onDelete={() => {
                            setDeleteQuestionIndex(index);
                        }}
                        onIndexUp={
                            index > 0
                                ? () => {
                                      const newQuestions = [...questions];
                                      const temp = newQuestions[index];
                                      newQuestions[index] = newQuestions[index - 1];
                                      newQuestions[index - 1] = temp;
                                      setProject({ ...project, questions: newQuestions });
                                  }
                                : undefined
                        }
                        onIndexDown={
                            index < questions.length - 1
                                ? () => {
                                      const newQuestions = [...questions];
                                      const temp = newQuestions[index];
                                      newQuestions[index] = newQuestions[index + 1];
                                      newQuestions[index + 1] = temp;
                                      setProject({ ...project, questions: newQuestions });
                                  }
                                : undefined
                        }
                    />
                ))}
            </Sortable>
            <Modal
                isOpen={deleteQuestionIndex !== -1}
                onClose={() => {
                    setDeleteQuestionIndex(-1);
                }}
                onConfirm={() => {
                    const newQuestions = [...questions];
                    newQuestions.splice(deleteQuestionIndex, 1);
                    setProject({ ...project, questions: newQuestions });
                    setDeleteQuestionIndex(-1);
                }}
                title={t('2_questions_page.delete_sequence_modal.title')}
                confirmLabel={t('common.actions.delete')}
                confirmLevel="error"
            >
                {t('2_questions_page.delete_sequence_modal.desc')} {questions[deleteQuestionIndex]?.question || ''} ?
            </Modal>
        </>
    );
};
