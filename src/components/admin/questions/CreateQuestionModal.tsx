import { useSnackbar } from "notistack";
import React from "react";

import FormHelperText from "@mui/material/FormHelperText";
import TextField from "@mui/material/TextField";

import { Modal } from "src/components/Modal";
import { UserServiceContext } from "src/services/UserService";
import type { Question } from "types/models/question.type";

interface CreateQuestionModalProps {
  scenarioId: number | string | null;
  languageCode: string;
  open?: boolean;
  onClose?(): void;
  order?: number;
  setQuestions?(f: (questions: Question[]) => Question[]): void;
}

export const CreateQuestionModal: React.FunctionComponent<CreateQuestionModalProps> = ({
  scenarioId,
  languageCode,
  open = false,
  onClose = () => {},
  order = 0,
  setQuestions = () => {},
}: CreateQuestionModalProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { axiosLoggedRequest } = React.useContext(UserServiceContext);
  const [question, setQuestion] = React.useState<string>("");
  const [hasError, setHasError] = React.useState<boolean>(false);

  const onQuestionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion(event.target.value.slice(0, 280));
    setHasError(false);
  };
  const onSubmit = async () => {
    if (question.length === 0) {
      setHasError(true);
      return;
    }
    const response = await axiosLoggedRequest({
      method: "POST",
      url: "/questions",
      data: {
        isDefault: true,
        question,
        scenarioId,
        languageCode,
        index: order,
      },
    });
    setQuestion("");
    if (response.error) {
      enqueueSnackbar("Une erreur inconnue est survenue...", {
        variant: "error",
      });
      onClose();
      return;
    }
    setQuestions((q) => {
      return [...q, response.data];
    });
    enqueueSnackbar("Question ajoutée avec succès!", {
      variant: "success",
    });
    onClose();
  };

  if (scenarioId === null) {
    return null;
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      onConfirm={onSubmit}
      confirmLabel="Créer"
      cancelLabel="Annuler"
      title="Ajouter une question"
      ariaLabelledBy="create-dialog-title"
      ariaDescribedBy="create-dialog-description"
      fullWidth
    >
      <div id="create-dialog-description">
        <TextField
          value={question}
          onChange={onQuestionChange}
          error={hasError}
          className={hasError ? "shake" : ""}
          label="Question"
          variant="outlined"
          fullWidth
          color="secondary"
        />
        <FormHelperText id="component-helper-text" style={{ marginLeft: "0.2rem", marginTop: "0.2rem" }}>
          {question.length}/280
        </FormHelperText>
      </div>
    </Modal>
  );
};
