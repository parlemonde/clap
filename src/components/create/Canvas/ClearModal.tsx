import React from "react";

import DialogContentText from "@mui/material/DialogContentText";

import { Modal } from "src/components/Modal";
import { useTranslation } from "src/i18n/useTranslation";

interface ClearModalProps {
  open?: boolean;
  onClear?(clear: boolean): () => void;
}

export const ClearModal: React.FunctionComponent<ClearModalProps> = ({ open = false, onClear = () => () => {} }: ClearModalProps) => {
  const { t } = useTranslation();
  return (
    <Modal open={open} ariaDescribedBy="clear-dialog-title" ariaLabelledBy="clear-dialog-description" onClose={onClear(false)} onConfirm={onClear(true)} title={t("tool_clear_title")}>
      <DialogContentText id="clear-dialog-description">{t("tool_clear_desc")}</DialogContentText>
    </Modal>
  );
};
