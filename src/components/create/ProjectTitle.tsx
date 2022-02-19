import React, { useContext } from "react";

import EditIcon from "@mui/icons-material/Edit";
import { Typography, IconButton } from "@mui/material";

import { useTranslation } from "src/i18n/useTranslation";
import { ProjectServiceContext } from "src/services/useProject";

interface ProjectTitleProp {
  smaller?: boolean;
  onClick?(event: React.MouseEvent): void;
}

export const ProjectTitle: React.FunctionComponent<ProjectTitleProp> = ({ smaller = false, onClick = () => {} }: ProjectTitleProp) => {
  const { t } = useTranslation();
  const { project } = useContext(ProjectServiceContext);

  if (project === null || project.id === null || project.id === -1) {
    return <div></div>;
  }

  return (
    <div className="text-center">
      <Typography
        color="primary"
        variant="h2"
        style={{
          display: "inline",
          fontSize: smaller ? "1.2rem" : "1.5rem",
        }}
      >
        {t("project")}
      </Typography>
      <Typography
        color="inherit"
        variant="h2"
        style={{
          display: "inline",
          marginLeft: "0.5rem",
          fontSize: smaller ? "1.2rem" : "1.5rem",
        }}
      >
        {project.title}
      </Typography>
      <IconButton sx={{ border: "1px solid", borderColor: (theme) => theme.palette.primary.main }} aria-label="edit" size="small" color="primary" style={{ marginLeft: "0.6rem", marginTop: "-0.3rem" }} onClick={onClick}>
        <EditIcon />
      </IconButton>
    </div>
  );
};
