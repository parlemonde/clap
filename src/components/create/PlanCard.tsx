import React from "react";

import DeleteIcon from "@mui/icons-material/Delete";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import { withStyles } from "@mui/styles";

import { useTranslation } from "src/i18n/useTranslation";
import type { Plan } from "types/models/plan.type";

const StyledDeleteButton = withStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.error.main,
    color: "white",
    "&:hover": {
      backgroundColor: theme.palette.error.light,
    },
  },
}))(IconButton);

interface PlanCardProps {
  plan: Plan;
  questionIndex: number;
  planIndex: number;
  showNumber: number;
  canDelete?: boolean;
  handleClick?(event: React.MouseEvent): void;
  handleDelete?(event: React.MouseEvent): void;
}

export const PlanCard: React.FunctionComponent<PlanCardProps> = ({ plan, questionIndex, planIndex, showNumber, canDelete = false, handleClick = () => {}, handleDelete = () => {} }: PlanCardProps) => {
  const { t } = useTranslation();
  const buttonStyle: React.CSSProperties = { width: "100%", height: "100%" };
  if (plan.url) {
    buttonStyle.backgroundImage = `url('${plan.url}')`;
    buttonStyle.backgroundPosition = "center"; /* Center the image */
    buttonStyle.backgroundRepeat = "no-repeat"; /* Do not repeat the image */
    buttonStyle.backgroundSize = "cover";
  }

  return (
    <div className="plan-button-container" key={planIndex}>
      <ButtonBase component="a" href={`/create/3-storyboard-and-filming-schedule/edit?question=${questionIndex}&plan=${planIndex}`} onClick={handleClick} style={buttonStyle}>
        <div className="plan">
          <div className="number">{showNumber}</div>
          <div className="edit">{t("edit")}</div>
          {canDelete && (
            <div className="delete">
              <StyledDeleteButton aria-label={t("delete")} size="small" onClick={handleDelete}>
                <DeleteIcon />
              </StyledDeleteButton>
            </div>
          )}
        </div>
      </ButtonBase>
    </div>
  );
};
