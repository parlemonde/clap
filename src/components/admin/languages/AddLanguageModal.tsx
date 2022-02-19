import { useSnackbar } from "notistack";
import React from "react";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";

import { Modal } from "src/components/Modal";
import { UserServiceContext } from "src/services/UserService";
import type { Language } from "types/models/language.type";

import allLanguages from "./iso_languages.json";

interface AddLanguageModalProps {
  open?: boolean;
  onClose?(): void;
  setLanguages?(f: (languages: Language[]) => Language[]): void;
}

export const AddLanguageModal: React.FunctionComponent<AddLanguageModalProps> = ({ open = false, onClose = () => {}, setLanguages = () => {} }: AddLanguageModalProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { axiosLoggedRequest } = React.useContext(UserServiceContext);
  const [selectedLanguageIndex, setSelectedLanguageIndex] = React.useState<number>(-1);

  const onSubmit = async () => {
    if (selectedLanguageIndex === -1) {
      return;
    }
    const newLanguage = {
      value: allLanguages[selectedLanguageIndex].code,
      label: allLanguages[selectedLanguageIndex].englishName,
    };
    const response = await axiosLoggedRequest({
      method: "POST",
      url: `/languages`,
      data: newLanguage,
    });
    if (response.error) {
      enqueueSnackbar("Une erreur inconnue est survenue...", {
        variant: "error",
      });
      setSelectedLanguageIndex(-1);
      onClose();
      return;
    }
    setLanguages((languages) => [...languages, newLanguage]);
    enqueueSnackbar("Langue ajoutée avec succès!", {
      variant: "success",
    });
    setSelectedLanguageIndex(-1);
    onClose();
  };

  const onSelectLanguage = (event: SelectChangeEvent<string | number>) => {
    setSelectedLanguageIndex(typeof event.target.value === "number" ? event.target.value : parseInt(event.target.value, 10));
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        setSelectedLanguageIndex(-1);
        onClose();
      }}
      onConfirm={onSubmit}
      confirmLabel="Ajouter"
      cancelLabel="Annuler"
      title="Ajouter une langue"
      ariaLabelledBy="new-dialog-title"
      ariaDescribedBy="new-dialog-description"
      fullWidth
    >
      <div id="new-dialog-description">
        <FormControl fullWidth color="secondary">
          <InputLabel id="demo-simple-select-label">Choisir la langue</InputLabel>
          <Select labelId="demo-simple-select-label" id="demo-simple-select" value={selectedLanguageIndex === -1 ? "" : selectedLanguageIndex} onChange={onSelectLanguage}>
            {allLanguages.map((l, index) => (
              <MenuItem value={index} key={l.code}>
                {l.englishName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </Modal>
  );
};
