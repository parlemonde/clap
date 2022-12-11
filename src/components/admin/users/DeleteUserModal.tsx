import { useSnackbar } from 'notistack';
import React from 'react';

import { useDeleteUserMutation } from 'src/api/users/users.delete';
import Modal from 'src/components/ui/Modal';
import type { User } from 'types/models/user.type';

interface DeleteUserModalProps {
    user?: User | null;
    onClose?(): void;
}

export const DeleteUserModal = ({ user = null, onClose = () => {} }: DeleteUserModalProps) => {
    const { enqueueSnackbar } = useSnackbar();

    const deleteUserMutation = useDeleteUserMutation();
    const onSubmit = async () => {
        if (user === null) {
            return;
        }
        try {
            await deleteUserMutation.mutateAsync({
                userId: user.id,
            });
            enqueueSnackbar('Utilisateur supprimé avec succès!', {
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
            isOpen={user !== null}
            isLoading={deleteUserMutation.isLoading}
            onClose={onClose}
            onConfirm={onSubmit}
            confirmLabel="Supprimer"
            confirmLevel="error"
            cancelLabel="Annuler"
            title="Supprimer l'utilisateur ?"
            ariaLabelledBy="delete-dialog-title"
            ariaDescribedBy="delete-dialog-description"
            isFullWidth
        >
            <div id="delete-dialog-description">
                {"Voulez-vous vraiment supprimer l'utilisateur "}
                <strong>{user?.pseudo || ''}</strong> ?
            </div>
        </Modal>
    );
};
