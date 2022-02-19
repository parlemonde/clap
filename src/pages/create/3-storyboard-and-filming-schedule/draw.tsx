import { useRouter } from "next/router";
import React from "react";

import Backdrop from "@mui/material/Backdrop";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";

import { Inverted } from "src/components/Inverted";
import { Canvas, CanvasRef } from "src/components/create/Canvas";
import { Steps } from "src/components/create/Steps";
import { ThemeLink } from "src/components/create/ThemeLink";
import { useTranslation } from "src/i18n/useTranslation";
import { usePlanRequests } from "src/services/usePlans";
import { ProjectServiceContext } from "src/services/useProject";
import { getQuestions } from "src/util";
import { getQueryString } from "src/util";

const useStyles = makeStyles((theme: Theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
}));

const PlanEdit: React.FunctionComponent = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { uploadPlanImage } = usePlanRequests();
  const classes = useStyles();
  const { project } = React.useContext(ProjectServiceContext);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const canvasRef = React.useRef<CanvasRef | null>(null);

  const questions = getQuestions(project);
  const questionIndex = parseInt(getQueryString(router.query.question) || "-1", 10);
  const planIndex = parseInt(getQueryString(router.query.plan) || "-1", 10);
  const question = questionIndex !== -1 ? questions[questionIndex] || null : null;

  const handleBack = (event: React.MouseEvent) => {
    event.preventDefault();
    router.push(`/create/3-storyboard-and-filming-schedule`);
  };

  const handleConfirm = async (event: React.MouseEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const imageBlob = await canvasRef.current.getBlob();
      await uploadPlanImage(questionIndex, planIndex, imageBlob);
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
    router.push(`/create/3-storyboard-and-filming-schedule/edit?question=${questionIndex}&plan=${planIndex}`);
  };

  return (
    <div>
      <ThemeLink />
      <Steps activeStep={2} />
      <div style={{ maxWidth: "1000px", margin: "auto", paddingBottom: "2rem" }}>
        <Typography color="primary" variant="h1">
          <Inverted round>3</Inverted> {t("draw_plan_title")}
        </Typography>
        <Typography variant="h2">
          <span>{t("part3_question")}</span> {question?.question}
        </Typography>
        <Typography variant="h2">
          <span>{t("part3_plan_number")}</span> {(question?.planStartIndex || 0) + planIndex}
        </Typography>

        <Canvas ref={canvasRef} />

        <Backdrop className={classes.backdrop} open={isLoading} onClick={() => {}}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <div style={{ width: "100%", textAlign: "right", margin: "2rem 0" }}>
          <Button component="a" variant="outlined" color="secondary" style={{ marginRight: "1rem" }} href="/create/3-storyboard-and-filming-schedule" onClick={handleBack}>
            {t("cancel")}
          </Button>
          <Button component="a" variant="contained" color="secondary" style={{ marginRight: "1rem" }} href={`/create/3-storyboard-and-filming-schedule/edit?question=${questionIndex}&plan=${planIndex}`} onClick={handleConfirm}>
            {t("save")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlanEdit;
