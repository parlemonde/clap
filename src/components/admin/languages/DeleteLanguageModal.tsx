import { useSnackbar } from 'notistack';
import React from 'react';

import { useDeleteLanguageMutation } from 'src/api/languages/languages.delete';
import Modal from 'src/components/ui/Modal';
import type { Language } from 'types/models/language.type';

interface DeleteLanguageModalProps {
    language?: Language | null;
    onClose?(): void;
}

export const DeleteLanguageModal: React.FunctionComponent<DeleteLanguageModalProps> = ({
    language = null,
    onClose = () => {},
}: DeleteLanguageModalProps) => {
    const { enqueueSnackbar } = useSnackbar();

    const deleteLanguageMutation = useDeleteLanguageMutation();
    const onSubmit = async () => {
        if (language === null) {
            return;
        }
        try {
            await deleteLanguageMutation.mutateAsync({
                languageId: language.value,
            });
            enqueueSnackbar('Language supprimé avec succès!', {
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
            isOpen={language !== null}
            isLoading={deleteLanguageMutation.isLoading}
            onClose={onClose}
            onConfirm={onSubmit}
            confirmLabel="Supprimer"
            confirmLevel="error"
            cancelLabel="Annuler"
            title="Supprimer le language ?"
            ariaLabelledBy="delete-dialog-title"
            ariaDescribedBy="delete-dialog-description"
            isFullWidth
        >
            <div id="delete-dialog-description">
                Voulez-vous vraiment supprimer le language <strong>{language?.label || ''}</strong> ?
                <br />
                Cette action est irréversible. Cependant les projets, thèmes, scénarios et questions liés à cette langue ne seront pas supprimés.
            </div>
        </Modal>
    );
};
