import React from "react";

import Close from "@mui/icons-material/Close";
import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";
import { makeStyles } from "@mui/styles";

import type { Language } from "types/models/language.type";

const useStyles = makeStyles(() => ({
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
}));

interface NameInputProps {
  value?: string;
  language?: Language;
  canDelete?: boolean;
  onChange?(event: React.ChangeEvent<HTMLInputElement>): void;
  onDelete?(): void;
}

export const NameInput: React.FunctionComponent<NameInputProps> = ({ value = "", language = { label: "Français", value: "fr" }, canDelete = false, onChange = () => {}, onDelete = () => {} }: NameInputProps) => {
  const classes = useStyles();

  return (
    <div className={classes.containerNames}>
      <div className={classes.textFieldLanguage}>{language.label}</div>

      <TextField variant="standard" color="secondary" id={language.value} type="text" value={value} onChange={onChange} fullWidth className={classes.textFieldNames} />

      {canDelete && (
        <Button style={{ borderRadius: "100px", minWidth: "32px", marginLeft: "8px" }} onClick={onDelete}>
          <Close />
        </Button>
      )}
    </div>
  );
};
