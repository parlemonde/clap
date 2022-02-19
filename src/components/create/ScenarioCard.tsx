import React from "react";

import Typography from "@mui/material/Typography";
import type { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";

import { useTranslation } from "src/i18n/useTranslation";
import { ProjectServiceContext } from "src/services/useProject";
import type { Scenario } from "types/models/scenario.type";

const useStyles = makeStyles((theme: Theme) => ({
  greenBorder: {
    borderColor: (theme.palette.secondary || {}).main,
    border: "1px solid",
  },
}));

interface ScenarioCardProps {
  scenario: Scenario;
  isNew?: boolean;
  onClick?(path: string): void;
}

export const ScenarioCard: React.FunctionComponent<ScenarioCardProps> = ({ scenario, isNew = false, onClick = () => {} }: ScenarioCardProps) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { updateProject } = React.useContext(ProjectServiceContext);

  const path = isNew ? "/create/1-scenario-choice/new" : "/create/2-questions-choice";

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!isNew) {
      updateProject({ scenario, questions: null, id: -1 });
    }
    onClick(path);
  };

  return (
    <a className={[classes.greenBorder, "card-container"].join(" ")} tabIndex={0} href={path} onClick={handleClick} style={isNew ? { backgroundColor: "#f0fafa" } : {}}>
      <div>
        <Typography color="primary" variant="h3">
          {scenario.name}
        </Typography>
      </div>
      <div>
        <p>{scenario.description}</p>
      </div>
      {scenario.questionsCount > 0 && <div className="steps">{t("step", { count: scenario.questionsCount })}</div>}

      <div className="arrow">{/* <Arrow /> */}</div>
    </a>
  );
};
