import { useRouter } from "next/router";
import { useQueryCache } from "react-query";
import { ReactSortable } from "react-sortablejs";
import React from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DialogContentText from "@mui/material/DialogContentText";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { Inverted } from "src/components/Inverted";
import { Modal } from "src/components/Modal";
import { Trans } from "src/components/Trans";
import { QuestionCard } from "src/components/create/QuestionCard";
import { Steps } from "src/components/create/Steps";
import { ThemeLink } from "src/components/create/ThemeLink";
import { useTranslation } from "src/i18n/useTranslation";
import { UserServiceContext } from "src/services/UserService";
import { usePlanRequests } from "src/services/usePlans";
import { ProjectServiceContext } from "src/services/useProject";
import { useQuestionRequests } from "src/services/useQuestions";
import type { Plan } from "types/models/plan.type";
import type { Question } from "types/models/question.type";

const QuestionChoice: React.FunctionComponent = () => {
  const router = useRouter();
  const { t, currentLocale } = useTranslation();
  const queryCache = useQueryCache();
  const { isLoggedIn, axiosLoggedRequest } = React.useContext(UserServiceContext);
  const { project, updateProject } = React.useContext(ProjectServiceContext);
  const { getDefaultQuestions, updateOrder, deleteQuestion } = useQuestionRequests();
  const { addPlan } = usePlanRequests();
  const [deleteIndex, setDeleteIndex] = React.useState<number | null>(null);
  const [showSaveModal, setShowSaveModal] = React.useState<boolean>(false);
  const [hasError, setHasError] = React.useState<boolean>(false);

  const setQuestions = React.useCallback(
    (questions: Question[] | null) => {
      if (questions !== null && isLoggedIn && project !== null && project.id !== -1 && project.id !== null) {
        if (questions.map((q) => q.id).join(",") !== project.questions.map((q) => q.id).join(",")) updateOrder(questions).catch();
      }
      updateProject({
        questions: questions === null ? null : questions.map((q, i) => ({ ...q, index: i })),
      });
    },
    [isLoggedIn, project, updateProject, updateOrder],
  );

  const getQuestions = React.useCallback(async () => {
    const defaultQuestions = await getDefaultQuestions({
      isDefault: true,
      scenarioId: project.scenario?.id || null,
      languageCode: currentLocale,
    });
    for (const question of defaultQuestions) {
      question.plans = [
        {
          id: 0,
          index: 0,
          description: "",
          image: null,
          url: null,
        },
      ];
    }
    setQuestions(defaultQuestions);
  }, [getDefaultQuestions, setQuestions, project.scenario, currentLocale]);

  React.useEffect(() => {
    if (project.questions === null) {
      getQuestions().catch();
    }
  }, [project.questions, getQuestions]);

  const handleNew = (event: React.MouseEvent) => {
    event.preventDefault();
    router.push(`/create/2-questions-choice/new`);
  };

  const handleEdit = (index: number) => (event: React.MouseEvent) => {
    event.preventDefault();
    router.push(`/create/2-questions-choice/edit?question=${index}`);
  };

  const handleDelete = (index: number) => (event: React.MouseEvent) => {
    event.preventDefault();
    setDeleteIndex(index);
  };

  const handleClose = (remove: boolean) => async () => {
    if (remove) {
      const questions = project.questions;
      if (questions === null) {
        return;
      }
      if (isLoggedIn && project !== null && project.id !== -1 && project.id !== null) {
        await deleteQuestion(questions[deleteIndex]);
      }
      questions.splice(deleteIndex, 1);
      updateProject({
        questions,
      });
    }
    setDeleteIndex(null);
  };

  const onShowSaveModalClose =
    (save: boolean = false) =>
    async () => {
      if (save && !project.title) {
        setHasError(true);
        return;
      }
      if (save) {
        const response = await axiosLoggedRequest({
          method: "POST",
          url: "/projects",
          data: project,
        });
        if (!response.error) {
          const questions: Question[] = response.data.questions;
          const requests: Promise<Plan | null>[] = [];
          for (let i = 0, n = questions.length; i < n; i++) {
            requests.push(addPlan(questions[i].id));
          }
          const plans: Array<Plan | null> = await Promise.all(requests);
          for (let i = 0, n = plans.length; i < n; i++) {
            if (plans[i] === null) {
              return;
            }
            if (questions[i]) {
              questions[i].plans = [plans[i]];
            }
          }
          updateProject({ ...response.data, questions });
          queryCache.invalidateQueries("projects");
        }
      }
      router.push(`/create/3-storyboard-and-filming-schedule`);
    };

  const updateProjectTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHasError(false);
    updateProject({ title: event.target.value });
  };

  const handleNext = (event: React.MouseEvent) => {
    event.preventDefault();
    if (isLoggedIn && project.id === -1) {
      updateProject({ title: "" });
      setShowSaveModal(true);
      return;
    }
    router.push(`/create/3-storyboard-and-filming-schedule`);
  };

  const toDeleteQuestion = project.questions !== null && deleteIndex !== null && deleteIndex < project.questions.length ? project.questions[deleteIndex].question : "";

  return (
    <div>
      <ThemeLink />
      <Steps activeStep={1} />
      <div style={{ maxWidth: "1000px", margin: "auto", paddingBottom: "2rem" }}>
        <Typography color="primary" variant="h1">
          <Inverted round>2</Inverted>{" "}
          <Trans i18nKey="part2_title">
            Mes <Inverted>questions</Inverted>
          </Trans>
        </Typography>
        <Typography color="inherit" variant="h2">
          {t("part2_desc")}
        </Typography>
        <Button
          component="a"
          variant="outlined"
          href={`/create/2-questions-choice/new`}
          color="secondary"
          onClick={handleNew}
          style={{
            textTransform: "none",
            marginTop: "2rem",
          }}
        >
          {t("add_question")}
        </Button>

        {project.questions !== null && (
          <ReactSortable tag="div" list={project.questions} setList={setQuestions} animation={200} handle=".question-index">
            {project.questions.map((q, index) => (
              <QuestionCard key={q.id} index={index} question={q.question} handleDelete={handleDelete(index)} handleEdit={handleEdit(index)} />
            ))}
          </ReactSortable>
        )}

        <Box sx={{ display: { xs: "none", md: "block" } }} style={{ width: "100%", textAlign: "right", marginTop: "2rem" }}>
          <Button component="a" href={`/create/3-storyboard-and-filming-schedule`} color="secondary" onClick={handleNext} variant="contained" style={{ width: "200px" }}>
            {t("next")}
          </Button>
        </Box>

        <Button sx={{ display: { xs: "inline-flex", md: "none" } }} component="a" href={`/create/3-storyboard-and-filming-schedule`} color="secondary" onClick={handleNext} variant="contained" style={{ width: "100%", marginTop: "2rem" }}>
          {t("next")}
        </Button>

        <Modal
          open={project.questions !== null && deleteIndex !== null}
          onClose={handleClose(false)}
          onConfirm={handleClose(true)}
          confirmLabel={t("delete")}
          cancelLabel={t("cancel")}
          title={t("part2_delete_question_title")}
          error={true}
          ariaLabelledBy="delete-dialog-title"
          ariaDescribedBy="delete-dialog-description"
          fullWidth
        >
          <DialogContentText id="delete-dialog-description">
            {t("part2_delete_question_desc")}
            <br />
            &quot;{toDeleteQuestion}&quot; ?
          </DialogContentText>
        </Modal>

        {isLoggedIn && (
          <Modal
            open={showSaveModal}
            title={t("project_save_title")}
            cancelLabel={t("project_save_cancel")}
            confirmLabel={t("project_save_confirm")}
            onClose={onShowSaveModalClose(false)}
            onConfirm={onShowSaveModalClose(true)}
            noCloseOutsideModal
            ariaLabelledBy="save-project-title"
            ariaDescribedBy="save-project-form"
            fullWidth
          >
            <div id="save-project-form">
              <p>{t("project_save_desc")}</p>
              <form className="project-form" noValidate autoComplete="off" style={{ margin: "1rem 0" }}>
                <TextField
                  id="project-name"
                  name="project-name"
                  type="text"
                  color="secondary"
                  label={t("project_save_label")}
                  value={project.title || ""}
                  onChange={updateProjectTitle}
                  variant="outlined"
                  size="small"
                  className={hasError ? "shake" : ""}
                  error={hasError}
                  helperText={hasError ? t("signup_required") : ""}
                  fullWidth
                />
              </form>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default QuestionChoice;
