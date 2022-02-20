import { useSnackbar } from "notistack";
import React from "react";

import { Modal } from "src/components/Modal";
import { UserServiceContext } from "src/services/UserService";
import type { Question } from "types/models/question.type";

interface DeleteQuestionModalProps {
  question?: Question | null;
  onClose?(): void;
  setQuestions?(f: (questions: Question[]) => Question[]): void;
}

export const DeleteQuestionModal: React.FunctionComponent<DeleteQuestionModalProps> = ({
  question = null,
  onClose = () => {},
  setQuestions = () => {},
}: DeleteQuestionModalProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { axiosLoggedRequest } = React.useContext(UserServiceContext);

  const onSubmit = async () => {
    if (question === null) {
      return;
    }
    const response = await axiosLoggedRequest({
      method: "DELETE",
      url: `/questions/${question.id}`,
    });
    if (response.error) {
      enqueueSnackbar("Une erreur inconnue est survenue...", {
        variant: "error",
      });
      onClose();
      return;
    }
    setQuestions((questions) => {
      const index = questions.findIndex((item) => item.id === question.id);
      if (index !== -1) {
        questions.splice(index, 1);
      }
      return [...questions];
    });
    enqueueSnackbar("Question supprimée avec succès!", {
      variant: "success",
    });
    onClose();
  };

  return (
    <Modal
      open={question !== null}
      onClose={onClose}
      onConfirm={onSubmit}
      confirmLabel="Supprimer"
      error
      cancelLabel="Annuler"
      title="Supprimer la question ?"
      ariaLabelledBy="create-dialog-title"
      ariaDescribedBy="create-dialog-description"
      fullWidth
    >
      <div id="create-dialog-description">
        Voulez-vous vraiment supprimer la question <strong>{question?.question || ""}</strong> ?
      </div>
    </Modal>
  );
};
