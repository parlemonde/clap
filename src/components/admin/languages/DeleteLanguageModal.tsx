import { useSnackbar } from "notistack";
import React from "react";

import { Modal } from "src/components/Modal";
import { UserServiceContext } from "src/services/UserService";
import type { Language } from "types/models/language.type";

interface DeleteLanguageModalProps {
  language?: Language | null;
  onClose?(): void;
  setLanguages?(f: (languages: Language[]) => Language[]): void;
}

export const DeleteLanguageModal: React.FunctionComponent<DeleteLanguageModalProps> = ({
  language = null,
  onClose = () => {},
  setLanguages = () => {},
}: DeleteLanguageModalProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { axiosLoggedRequest } = React.useContext(UserServiceContext);

  const onSubmit = async () => {
    if (language === null) {
      return;
    }
    const response = await axiosLoggedRequest({
      method: "DELETE",
      url: `/languages/${language.value}`,
    });
    if (response.error) {
      enqueueSnackbar("Une erreur inconnue est survenue...", {
        variant: "error",
      });
      onClose();
      return;
    }
    setLanguages((languages) => [...languages.filter((l) => l.value !== language.value)]);
    enqueueSnackbar("Language supprimé avec succès!", {
      variant: "success",
    });
    onClose();
  };

  return (
    <Modal
      open={language !== null}
      onClose={onClose}
      onConfirm={onSubmit}
      confirmLabel="Supprimer"
      error
      cancelLabel="Annuler"
      title="Supprimer le language ?"
      ariaLabelledBy="delete-dialog-title"
      ariaDescribedBy="delete-dialog-description"
      fullWidth
    >
      <div id="delete-dialog-description">
        Voulez-vous vraiment supprimer le language <strong>{language?.label || ""}</strong> ?
        <br />
        Cette action est irréversible. Cependant les projets, thèmes, scénarios et questions liés à cette langue ne seront pas supprimés.
      </div>
    </Modal>
  );
};
