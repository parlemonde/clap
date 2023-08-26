import React from 'react';

import { useDeleteQuestionTemplateMutation } from 'src/api/question-templates/question-templates.delete';
import { Modal } from 'src/components/layout/Modal';
import { sendToast } from 'src/components/ui/Toasts';
import type { QuestionTemplate } from 'types/models/question.type';

interface DeleteQuestionModalProps {
    question?: QuestionTemplate | null;
    onClose?(): void;
}

export const DeleteQuestionModal = ({ question = null, onClose = () => {} }: DeleteQuestionModalProps) => {
    const deleteQuestionTemplateMutation = useDeleteQuestionTemplateMutation();
    const onSubmit = async () => {
        if (question === null) {
            return;
        }
        try {
            await deleteQuestionTemplateMutation.mutateAsync({
                questionId: question.id,
            });
            sendToast({ message: 'Question supprimée avec succès!', type: 'success' });
            onClose();
        } catch (err) {
            console.error(err);
            sendToast({ message: 'Une erreur inconnue est survenue...', type: 'error' });
        }
    };

    return (
        <Modal
            isOpen={question !== null}
            onClose={onClose}
            isLoading={deleteQuestionTemplateMutation.isLoading}
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
