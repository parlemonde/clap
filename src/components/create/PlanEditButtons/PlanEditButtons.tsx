import { useRouter } from "next/router";
import Camera from "react-html5-camera-photo";
import React, { useRef, useState } from "react";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CreateIcon from "@mui/icons-material/Create";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import type { Theme } from "@mui/material/styles";
import { Backdrop, Button, CircularProgress, Hidden, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

import { useTranslation } from "src/i18n/useTranslation";

import { PlanUpload } from "./PlanUpload";

const useStyles = makeStyles((theme: Theme) => ({
  verticalLine: {
    backgroundColor: theme.palette.secondary.main,
    flex: 1,
    width: "1px",
    margin: "0.2rem 0",
  },
  horizontalLine: {
    backgroundColor: theme.palette.secondary.main,
    flex: 1,
    height: "1px",
    margin: "2rem 1rem",
  },
  secondaryColor: {
    color: theme.palette.secondary.main,
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
}));

interface PlanEditButtonsProps {
  questionIndex: number;
  planIndex: number;
  submitImageWithUrl?(img: Blob): Promise<void>;
}

export const PlanEditButtons: React.FunctionComponent<PlanEditButtonsProps> = ({ questionIndex, planIndex, submitImageWithUrl = async () => {} }: PlanEditButtonsProps) => {
  const router = useRouter();
  const { t } = useTranslation();
  const classes = useStyles();

  const inputRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputchange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files.length > 0) {
      const url = URL.createObjectURL(event.target.files[0]);
      setImageUrl(url);
    } else {
      setImageUrl(null);
    }
  };

  const handleClearInput = () => {
    setImageUrl(null);
    if (inputRef.current !== undefined && inputRef.current !== null) {
      inputRef.current.value = "";
    }
  };

  const submitImage = async (img: Blob) => {
    setIsLoading(true);
    await submitImageWithUrl(img);
    setIsLoading(false);
  };

  const handleDraw = (event: React.MouseEvent) => {
    event.preventDefault();
    router.push(`/create/3-storyboard-and-filming-schedule/draw?question=${questionIndex}&plan=${planIndex}`);
  };

  const toggleShowCamera = (show: boolean) => () => {
    setShowCamera(show);
  };

  const handlePhotoTaken = (imageUri: string) => {
    setTimeout(() => {
      setShowCamera(false);
      setImageUrl(imageUri);
    }, 0);
  };

  let content;
  if (showCamera) {
    content = (
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <Camera onTakePhoto={handlePhotoTaken} isSilentMode={true} />
        <Button variant="outlined" color="secondary" className="mobile-full-width" onClick={toggleShowCamera(false)}>
          {t("cancel")}
        </Button>
      </div>
    );
  } else if (imageUrl !== null && imageUrl.length > 0) {
    content = <PlanUpload imageUrl={imageUrl} handleClearInput={handleClearInput} handleSubmit={submitImage} />;
  } else {
    content = (
      <React.Fragment>
        <Hidden smDown>
          <Typography color="inherit" variant="h2">
            {t("part3_plan_edit_title_desktop")}
          </Typography>
          <div className="edit-plans-container">
            <Button variant="outlined" color="secondary" component="label" htmlFor="plan-img-upload" style={{ textTransform: "none" }} startIcon={<CloudUploadIcon />}>
              {t("import_image")}
            </Button>
            <div className="or-vertical-divider">
              <div className={classes.verticalLine} />
              <span className={classes.secondaryColor}>{t("or").toUpperCase()}</span>
              <div className={classes.verticalLine} />
            </div>
            <Button variant="outlined" color="secondary" style={{ textTransform: "none" }} onClick={toggleShowCamera(true)} startIcon={<PhotoCameraIcon />}>
              {t("take_picture")}
            </Button>
            <div className="or-vertical-divider">
              <div className={classes.verticalLine} />
              <span className={classes.secondaryColor}>{t("or").toUpperCase()}</span>
              <div className={classes.verticalLine} />
            </div>
            <Button
              component="a"
              variant="outlined"
              color="secondary"
              style={{ textTransform: "none" }}
              startIcon={<CreateIcon />}
              href={`/create/3-storyboard-and-filming-schedule/draw?question=${questionIndex}&plan=${planIndex}`}
              onClick={handleDraw}
            >
              {t("draw_plan")}
            </Button>
          </div>
        </Hidden>
        <Hidden mdUp>
          <Typography color="inherit" variant="h2">
            {t("part3_plan_edit_title_mobile")}
          </Typography>
          <div className="edit-plans-container-mobile" style={{ marginTop: "1rem" }}>
            <Button variant="outlined" component="label" htmlFor="plan-img-upload" color="secondary" style={{ textTransform: "none", width: "100%" }} startIcon={<CloudUploadIcon />}>
              {t("import_image")}
            </Button>
            <div className="or-horizontal-divider">
              <div className={classes.horizontalLine} />
              <span className={classes.secondaryColor}>{t("or").toUpperCase()}</span>
              <div className={classes.horizontalLine} />
            </div>
            <Button variant="outlined" color="secondary" style={{ textTransform: "none" }} onClick={toggleShowCamera(true)} startIcon={<PhotoCameraIcon />}>
              {t("take_picture")}
            </Button>
          </div>
        </Hidden>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <Backdrop className={classes.backdrop} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {content}
      <input id="plan-img-upload" type="file" accept="image/*" onChange={handleInputchange} ref={inputRef} style={{ display: "none" }} />
    </React.Fragment>
  );
};
