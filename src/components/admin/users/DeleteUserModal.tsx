import React from 'react';

import { useDeleteUserMutation } from 'src/api/users/users.delete';
import { Modal } from 'src/components/layout/Modal';
import { sendToast } from 'src/components/ui/Toasts';
import type { User } from 'types/models/user.type';

interface DeleteUserModalProps {
    user?: User | null;
    onClose?(): void;
}

export const DeleteUserModal = ({ user = null, onClose = () => {} }: DeleteUserModalProps) => {
    const deleteUserMutation = useDeleteUserMutation();
    const onSubmit = async () => {
        if (user === null) {
            return;
        }
        try {
            await deleteUserMutation.mutateAsync({
                userId: user.id,
            });
            sendToast({ message: 'Utilisateur supprimé avec succès!', type: 'success' });
            onClose();
        } catch (err) {
            console.error(err);
            sendToast({ message: 'Une erreur inconnue est survenue...', type: 'error' });
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
            isFullWidth
        >
            {"Voulez-vous vraiment supprimer l'utilisateur "}
            <strong>{user?.pseudo || ''}</strong> ?
        </Modal>
    );
};
