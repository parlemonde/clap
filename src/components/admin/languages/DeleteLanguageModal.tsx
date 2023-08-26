import React from 'react';

import { useDeleteLanguageMutation } from 'src/api/languages/languages.delete';
import { Modal } from 'src/components/layout/Modal';
import { sendToast } from 'src/components/ui/Toasts';
import type { Language } from 'types/models/language.type';

interface DeleteLanguageModalProps {
    language?: Language | null;
    onClose?(): void;
}

export const DeleteLanguageModal: React.FunctionComponent<DeleteLanguageModalProps> = ({
    language = null,
    onClose = () => {},
}: DeleteLanguageModalProps) => {
    const deleteLanguageMutation = useDeleteLanguageMutation();
    const onSubmit = async () => {
        if (language === null) {
            return;
        }
        try {
            await deleteLanguageMutation.mutateAsync({
                languageId: language.value,
            });
            sendToast({ message: 'Language supprimé avec succès!', type: 'success' });
            onClose();
        } catch (err) {
            console.error(err);
            sendToast({ message: 'Une erreur inconnue est survenue...', type: 'error' });
        }
    };

    return (
        <Modal
            isOpen={language !== null}
            isLoading={deleteLanguageMutation.isLoading}
            onClose={onClose}
            onConfirm={onSubmit}
            confirmLabel="Supprimer"
            confirmLevel="error"
            cancelLabel="Annuler"
            title="Supprimer le language ?"
            isFullWidth
        >
            Voulez-vous vraiment supprimer le language <strong>{language?.label || ''}</strong> ?
            <br />
            Cette action est irréversible. Cependant les projets, thèmes, scénarios et questions liés à cette langue ne seront pas supprimés.
        </Modal>
    );
};
