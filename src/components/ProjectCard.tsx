import React from "react";

import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import { Typography, ButtonBase } from "@mui/material";

import { useTranslation } from "src/i18n/useTranslation";

// import "./workInProgressCard.css";

interface ProjectCardProps {
  title?: string;
  themeName?: string;
  onClick?(event: React.MouseEvent): void;
  onClickEdit?(event: React.MouseEvent): void;
}

export const ProjectCard: React.FunctionComponent<ProjectCardProps> = ({
  title = "",
  themeName = "",
  onClick = () => {},
  onClickEdit = () => {},
}: ProjectCardProps) => {
  const { t } = useTranslation();

  return (
    <ButtonBase focusRipple onClick={onClick} className="wip-container-container">
      <div className="wip-container">
        <Typography color="primary" variant="h3" className="text-center">
          {title}
        </Typography>
        {themeName !== "" && (
          <div className="theme-name">
            <label>{t("my_videos_themes")}</label> {themeName}
          </div>
        )}
        <div className="edit">
          <IconButton
            color="primary"
            aria-label={t("delete")}
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              onClickEdit(event);
            }}
            style={{ border: "1px solid #6065fc" }}
          >
            <EditIcon />
          </IconButton>
        </div>
      </div>
    </ButtonBase>
  );
};
