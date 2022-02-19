import { useSnackbar } from "notistack";
import React from "react";

import { Button } from "@mui/material";

import { Modal } from "src/components/Modal";
import { UserServiceContext } from "src/services/UserService";
import type { Language } from "types/models/language.type";

interface UploadLanguageModalProps {
  language?: Language | null;
  onClose?(): void;
}

export const UploadLanguageModal: React.FunctionComponent<UploadLanguageModalProps> = ({ language = null, onClose = () => {} }: UploadLanguageModalProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { axiosLoggedRequest } = React.useContext(UserServiceContext);
  const [file, setFile] = React.useState<File | null>(null);

  const onSubmit = async () => {
    if (language === null || file === null) {
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosLoggedRequest({
      method: "POST",
      url: `/languages/${language.value}/po`,
      data: formData,
    });
    if (response.error) {
      enqueueSnackbar("Une erreur inconnue est survenue...", {
        variant: "error",
      });
    }
    enqueueSnackbar("Traductions modifiées avec succès!", {
      variant: "success",
    });
    setFile(null);
    onClose();
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    } else {
      setFile(null);
    }
  };

  return (
    <Modal
      open={language !== null}
      onClose={() => {
        setFile(null);
        onClose();
      }}
      onConfirm={onSubmit}
      confirmLabel="Mettre à jour"
      cancelLabel="Annuler"
      title="Mettre à jour la langue"
      ariaLabelledBy="delete-dialog-title"
      ariaDescribedBy="delete-dialog-description"
      fullWidth
    >
      <div id="delete-dialog-description">{"Veuillez choisir le fichier .po de la langue pour la mettre à jour. Attention ! Ne vous trompez pas de langue, l'API actuelle ne vérifie pas si la langue dans le fichier .po envoyée correspond bien."}</div>
      <div style={{ width: "100%", textAlign: "center", margin: "1rem 0" }}>
        <Button component="label" htmlFor="new-language-po" style={{ textTransform: "none" }} color="secondary" variant="contained">
          {file === null ? (
            <>
              Choisir le fichier pour la langue :<strong style={{ marginLeft: "0.3rem" }}>{language?.label || ""}</strong>
            </>
          ) : (
            `${file.name} | changer`
          )}
        </Button>

        <input style={{ display: "none" }} type="file" accept=".po" id="new-language-po" onChange={onFileChange}></input>
      </div>
    </Modal>
  );
};
