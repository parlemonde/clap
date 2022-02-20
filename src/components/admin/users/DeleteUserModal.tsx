import { useSnackbar } from "notistack";
import { useQueryCache } from "react-query";
import React from "react";

import { Modal } from "src/components/Modal";
import { UserServiceContext } from "src/services/UserService";
import type { User } from "types/models/user.type";

interface DeleteUserModalProps {
  user?: User | null;
  onClose?(): void;
}

export const DeleteUserModal: React.FunctionComponent<DeleteUserModalProps> = ({ user = null, onClose = () => {} }: DeleteUserModalProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryCache = useQueryCache();
  const { axiosLoggedRequest } = React.useContext(UserServiceContext);

  const onSubmit = async () => {
    if (user === null) {
      return;
    }
    const response = await axiosLoggedRequest({
      method: "DELETE",
      url: `/users/${user.id}`,
    });
    if (response.error) {
      enqueueSnackbar("Une erreur inconnue est survenue...", {
        variant: "error",
      });
      onClose();
      return;
    }
    queryCache.invalidateQueries("users");
    enqueueSnackbar("Utilisateur supprimé avec succès!", {
      variant: "success",
    });
    onClose();
  };

  return (
    <Modal
      open={user !== null}
      onClose={onClose}
      onConfirm={onSubmit}
      confirmLabel="Supprimer"
      error
      cancelLabel="Annuler"
      title="Supprimer l'utilisateur ?"
      ariaLabelledBy="delete-dialog-title"
      ariaDescribedBy="delete-dialog-description"
      fullWidth
    >
      <div id="delete-dialog-description">
        {"Voulez-vous vraiment supprimer l'utilisateur "}
        <strong>{user?.pseudo || ""}</strong> ?
      </div>
    </Modal>
  );
};
