'use client';

import React from 'react';

import { Modal } from '@frontend/components/layout/Modal';

import type { Question } from '@server/database/schemas/questions';

import { deleteQuestion } from '@server-actions/questions/delete-question';

interface DeleteQuestionModalProps {
    question?: Question | null;
    onClose?(): void;
}
export const DeleteQuestionModal = ({ question = null, onClose = () => {} }: DeleteQuestionModalProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const onSubmit = async () => {
        if (!question) {
            return;
        }

        setIsLoading(true);
        await deleteQuestion(question.id);
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
