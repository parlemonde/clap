import { useRouter } from "next/router";
import React from "react";

import Button from "@mui/material/Button";
import FormHelperText from "@mui/material/FormHelperText";
import Hidden from "@mui/material/Hidden";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { Inverted } from "src/components/Inverted";
import { Trans } from "src/components/Trans";
import { Steps } from "src/components/create/Steps";
import { ThemeLink } from "src/components/create/ThemeLink";
import { useTranslation } from "src/i18n/useTranslation";
import { ProjectServiceContext } from "src/services/useProject";
import { useQuestionRequests } from "src/services/useQuestions";
import { getQueryString } from "src/util";

const QuestionEdit: React.FunctionComponent = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { project, updateProject } = React.useContext(ProjectServiceContext);
  const { editQuestion } = useQuestionRequests();
  const [hasError, setHasError] = React.useState<boolean>(false);
  const [question, setQuestion] = React.useState<string>("");
  const questionId = parseInt(getQueryString(router.query.question) || "-1", 10);

  const canEditQuestion = React.useMemo(() => project.questions !== null && questionId !== -1 && questionId < project.questions.length, [project.questions, questionId]);
  React.useEffect(() => {
    setQuestion(canEditQuestion ? project.questions[questionId].question : "");
  }, [canEditQuestion, project.questions, questionId]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setQuestion(event.target.value.slice(0, 280));
  };

  const handleBack = (event: React.MouseEvent) => {
    event.preventDefault();
    router.push(`/create/2-questions-choice`);
  };

  const handleSubmit = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (question.length === 0) {
      setHasError(true);
      setTimeout(() => {
        setHasError(false);
      }, 1000);
      return;
    }
    if (!canEditQuestion) {
      return;
    }
    const questions = project.questions;
    questions[questionId].question = question;
    updateProject({
      questions,
    });
    if (project !== null && project.id !== null && project.id !== -1) {
      await editQuestion(questions[questionId]);
    }
    router.push(`/create/2-questions-choice`);
  };

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
          {t("part2_edit_question")}
        </Typography>
        <Typography color="inherit" variant="h2" style={{ marginTop: "1rem" }}>
          <div>
            <TextField
              value={question}
              onChange={handleChange}
              required
              error={hasError}
              className={hasError ? "shake" : ""}
              id="scenarioDescription"
              multiline
              placeholder={t("part2_add_question_placeholder")}
              fullWidth
              style={{ marginTop: "0.5rem" }}
              variant="outlined"
              color="secondary"
              autoComplete="off"
            />
            <FormHelperText id="component-helper-text" style={{ marginLeft: "0.2rem", marginTop: "0.2rem" }}>
              {question.length}/280
            </FormHelperText>
          </div>
        </Typography>
        <Hidden smDown implementation="css">
          <div style={{ width: "100%", textAlign: "right" }}>
            <Button component="a" variant="outlined" color="secondary" style={{ marginRight: "1rem" }} href={`/create/2-questions-choice`} onClick={handleBack}>
              {t("cancel")}
            </Button>
            <Button variant="contained" color="secondary" onClick={handleSubmit}>
              {t("edit")}
            </Button>
          </div>
        </Hidden>
        <Hidden mdUp implementation="css">
          <Button variant="contained" color="secondary" onClick={handleSubmit} style={{ width: "100%", marginTop: "2rem" }}>
            {t("edit")}
          </Button>
        </Hidden>
      </div>
    </div>
  );
};

export default QuestionEdit;
