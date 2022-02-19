import { useRouter } from "next/router";
import React from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormHelperText from "@mui/material/FormHelperText";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { Inverted } from "src/components/Inverted";
import { Modal } from "src/components/Modal";
import { PlanEditButtons } from "src/components/create/PlanEditButtons";
import { Steps } from "src/components/create/Steps";
import { ThemeLink } from "src/components/create/ThemeLink";
import { useTranslation } from "src/i18n/useTranslation";
import { usePlanRequests } from "src/services/usePlans";
import { ProjectServiceContext } from "src/services/useProject";
import { getQuestions } from "src/util";
import { getQueryString } from "src/util";
import type { Question } from "types/models/question.type";

const PlanEdit: React.FunctionComponent = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { uploadPlanImage, updatePlan } = usePlanRequests();
  const { project, updateProject } = React.useContext(ProjectServiceContext);
  const [showEditPlan, setShowEditPlan] = React.useState<boolean>(false);

  const questions = getQuestions(project);
  const questionIndex = parseInt(getQueryString(router.query.question) || "-1", 10);
  const planIndex = parseInt(getQueryString(router.query.plan) || "-1", 10);
  const question = questionIndex !== -1 ? questions[questionIndex] || null : null;
  const plan = planIndex !== -1 && question !== null ? (question.plans || [])[planIndex] : null;

  const updateQuestion = (index: number, newQuestion: Partial<Question>) => {
    const questions = project.questions || [];
    const prevQuestion = project.questions[index];
    questions[index] = { ...prevQuestion, ...newQuestion };
    updateProject({ questions });
  };

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (plan === null || question === null) {
      return;
    }
    question.plans[planIndex].description = (event.target.value || "").slice(0, 2000);
    updateQuestion(questionIndex, question);
  };
  const handleDescriptionBlur = async (event: React.FocusEvent<HTMLTextAreaElement>) => {
    const plan = question.plans[planIndex];
    await updatePlan({ ...plan, description: (event.target.value || "").slice(0, 2000) });
  };

  const handleBack = (event: React.MouseEvent) => {
    event.preventDefault();
    router.push(`/create/3-storyboard-and-filming-schedule`);
  };

  const handleEditPlanModal = (isOpen: boolean) => () => {
    setShowEditPlan(isOpen);
  };

  const submitImageWithUrl = async (imageBlob: Blob) => {
    try {
      await uploadPlanImage(questionIndex, planIndex, imageBlob);
    } catch (e) {
      console.error(e);
    }
    setShowEditPlan(false);
  };

  return (
    <div>
      <ThemeLink />
      <Steps activeStep={2} />
      <div style={{ maxWidth: "1000px", margin: "auto", paddingBottom: "2rem" }}>
        <Typography color="primary" variant="h1">
          <Inverted round>3</Inverted> {t("part3_edit_plan")}
        </Typography>
        <Typography variant="h2">
          <span>{t("part3_question")}</span> {question?.question}
        </Typography>
        <Typography variant="h2">
          <span>{t("part3_plan_number")}</span> {(question?.planStartIndex || 0) + planIndex}
        </Typography>

        {question !== null && plan !== null && (
          <Typography color="inherit" variant="h2" style={{ margin: "1rem 0" }}>
            {t("part3_plan_desc")}
            <div>
              <TextField
                value={question.plans[planIndex].description || ""}
                onChange={handleDescriptionChange}
                onBlur={handleDescriptionBlur}
                required
                multiline
                placeholder={t("part3_plan_desc_placeholder")}
                fullWidth
                style={{ marginTop: "0.5rem" }}
                variant="outlined"
                color="secondary"
                autoComplete="off"
              />
              <FormHelperText id="component-helper-text" style={{ marginLeft: "0.2rem", marginTop: "0.2rem" }}>
                {(question.plans[planIndex].description || "").length}/2000
              </FormHelperText>
            </div>
          </Typography>
        )}

        {question !== null && plan !== null && plan.url && (
          <div>
            <Typography color="inherit" variant="h2" style={{ margin: "1rem 0" }}>
              {t("part3_plan_image")}
            </Typography>
            <div className="text-center">
              <img className="plan-img" alt="dessin du plan" src={plan.url} />
            </div>
            <div className="text-center">
              <Button className="plan-button" variant="outlined" color="secondary" style={{ display: "inline-block" }} onClick={handleEditPlanModal(true)}>
                {t("part3_change_image")}
              </Button>
            </div>
            <Modal ariaLabelledBy="edit-drawing-title" ariaDescribedBy="edit-drawing-desc" title={t("part3_change_image_title")} onClose={handleEditPlanModal(false)} fullWidth={true} maxWidth="md" open={showEditPlan}>
              <div id="edit-drawing-desc">
                <PlanEditButtons questionIndex={questionIndex} planIndex={planIndex} submitImageWithUrl={submitImageWithUrl} />
              </div>
            </Modal>
          </div>
        )}

        {(question !== null && plan !== null && !!plan.url) || <PlanEditButtons questionIndex={questionIndex} planIndex={planIndex} submitImageWithUrl={submitImageWithUrl} />}

        <Box sx={{ display: { xs: "none", md: "block" } }} style={{ width: "100%", textAlign: "right" }}>
          <Button component="a" variant="contained" color="secondary" style={{ margin: "0 1rem 3rem 0" }} href="/create/3-storyboard-and-filming-schedule" onClick={handleBack}>
            {t("continue")}
          </Button>
        </Box>
        <Button sx={{ display: { xs: "inline-flex", md: "none" } }} component="a" variant="contained" color="secondary" style={{ margin: "3rem 0", width: "100%" }} href={`/create/3-storyboard-and-filming-schedule`} onClick={handleBack}>
          {t("continue")}
        </Button>
      </div>
    </div>
  );
};

export default PlanEdit;
