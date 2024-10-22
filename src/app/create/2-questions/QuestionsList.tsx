import React from 'react';

import { QuestionCard } from 'src/components/create/QuestionCard';
import type { Project } from 'src/hooks/useLocalStorage/local-storage';

interface QuestionsListProps {
    project: Project;
    setProject: (newProject: Project) => void;
}

export const QuestionsList = ({ project, setProject }: QuestionsListProps) => {
    const questions = project.questions;

    return questions.map((question, index) => (
        <QuestionCard
            key={question.id}
            projectId={null}
            question={question.question}
            index={index}
            onDelete={() => {
                const newQuestions = [...questions];
                newQuestions.splice(index, 1);
                setProject({ ...project, questions: newQuestions });
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
    ));
};
