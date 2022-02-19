import React from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { useTranslation } from "src/i18n/useTranslation";
import { ProjectServiceContext } from "src/services/useProject";
import type { Scenario } from "types/models/scenario.type";

interface ScenarioCardProps {
  scenario: Scenario;
  isNew?: boolean;
  onClick?(path: string): void;
}

export const ScenarioCard: React.FunctionComponent<ScenarioCardProps> = ({ scenario, isNew = false, onClick = () => {} }: ScenarioCardProps) => {
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
    <Box component="a" sx={{ border: "1px solid", borderColor: (theme) => theme.palette.secondary.main }} className="card-container" tabIndex={0} href={path} onClick={handleClick} style={isNew ? { backgroundColor: "#f0fafa" } : {}}>
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
    </Box>
  );
};
