import React from "react";

import Close from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";

import type { Language } from "types/models/language.type";

const styles = {
  containerNames: {
    display: "flex",
    marginBottom: 16,
    alignItems: "center",
  },
  textFieldLanguage: {
    marginRight: "8px",
    fontWeight: "bold",
  },
  textFieldNames: {
    margin: "0px 0px 0px 4px",
  },
};

interface NameInputProps {
  value?: string;
  language?: Language;
  canDelete?: boolean;
  onChange?(event: React.ChangeEvent<HTMLInputElement>): void;
  onDelete?(): void;
}

export const NameInput: React.FunctionComponent<NameInputProps> = ({ value = "", language = { label: "Français", value: "fr" }, canDelete = false, onChange = () => {}, onDelete = () => {} }: NameInputProps) => {
  return (
    <Box sx={styles.containerNames}>
      <Box sx={styles.textFieldLanguage}>{language.label}</Box>

      <TextField variant="standard" color="secondary" id={language.value} type="text" value={value} onChange={onChange} fullWidth sx={styles.textFieldNames} />

      {canDelete && (
        <Button style={{ borderRadius: "100px", minWidth: "32px", marginLeft: "8px" }} onClick={onDelete}>
          <Close />
        </Button>
      )}
    </Box>
  );
};
