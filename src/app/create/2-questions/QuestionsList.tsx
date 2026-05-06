import { useExtracted } from 'next-intl';
import React from 'react';

import { QuestionCard } from '@frontend/components/create/QuestionCard';
import { Modal } from '@frontend/components/layout/Modal';
import { Sortable } from '@frontend/components/ui/Sortable';
import type { ProjectData, Sequence } from '@server/database/schemas/projects';

interface QuestionsListProps {
    project: ProjectData;
    setProject: (newProject: ProjectData) => void;
}

export const QuestionsList = ({ project, setProject }: QuestionsListProps) => {
    const tx = useExtracted('create.2-questions.QuestionsList');
    const commonT = useExtracted('common');
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
                title={tx('Supprimer la séquence ?')}
                confirmLabel={commonT('Supprimer')}
                confirmLevel="error"
            >
                {tx('Voulez-vous vraiment supprimer la séquence :')} {questions[deleteQuestionIndex]?.question || ''} ?
            </Modal>
        </>
    );
};
