'use client';

import React from 'react';

import { deleteQuestionTemplate } from 'src/actions/questions-templates/delete-question-template';
import { Modal } from 'src/components/layout/Modal';
import type { QuestionTemplate } from 'src/database/schemas/question-template';

interface DeleteQuestionModalProps {
    question?: QuestionTemplate | null;
    onClose?(): void;
}
export const DeleteQuestionModal = ({ question = null, onClose = () => {} }: DeleteQuestionModalProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const onSubmit = async () => {
        if (!question) {
            return;
        }

        setIsLoading(true);
        await deleteQuestionTemplate(question.id);
        onClose();
        setIsLoading(false);
    };

    return (
        <Modal
            isOpen={question !== null}
            onClose={onClose}
            isLoading={isLoading}
            onConfirm={onSubmit}
            confirmLabel="Supprimer"
            confirmLevel="error"
            cancelLabel="Annuler"
            title="Supprimer la question ?"
            isFullWidth
        >
            Voulez-vous vraiment supprimer la question <strong>{question?.question || ''}</strong> ?
        </Modal>
    );
};
