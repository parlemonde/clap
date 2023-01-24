import { useSnackbar } from 'notistack';
import React from 'react';

import { useDeleteQuestionTemplateMutation } from 'src/api/question-templates/question-templates.delete';
import Modal from 'src/components/ui/Modal';
import type { QuestionTemplate } from 'types/models/question.type';

interface DeleteQuestionModalProps {
    question?: QuestionTemplate | null;
    onClose?(): void;
}

export const DeleteQuestionModal = ({ question = null, onClose = () => {} }: DeleteQuestionModalProps) => {
    const { enqueueSnackbar } = useSnackbar();

    const deleteQuestionTemplateMutation = useDeleteQuestionTemplateMutation();
    const onSubmit = async () => {
        if (question === null) {
            return;
        }
        try {
            await deleteQuestionTemplateMutation.mutateAsync({
                questionId: question.id,
            });
            enqueueSnackbar('Question supprimée avec succès!', {
                variant: 'success',
            });
            onClose();
        } catch (err) {
            console.error(err);
            enqueueSnackbar('Une erreur inconnue est survenue...', {
                variant: 'error',
            });
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
            ariaLabelledBy="create-dialog-title"
            ariaDescribedBy="create-dialog-description"
            isFullWidth
        >
            <div id="create-dialog-description">
                Voulez-vous vraiment supprimer la question <strong>{question?.question || ''}</strong> ?
            </div>
        </Modal>
    );
};
