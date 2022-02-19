import classnames from "classnames";
import React from "react";

import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import type { Theme } from "@mui/material/styles";
import { makeStyles, withStyles } from "@mui/styles";

const StyledDeleteButton = withStyles((theme: Theme) => ({
  root: {
    border: "1px solid",
    borderColor: theme.palette.secondary.main,
  },
}))(IconButton);

const useStyles = makeStyles((theme: Theme) => ({
  greenBorder: {
    borderColor: (theme.palette.secondary || {}).main,
    border: "1px solid",
  },
  greenBackground: {
    backgroundColor: (theme.palette.secondary || {}).main,
  },
}));

interface QuestionCardProps {
  question: string;
  index?: number;
  handleDelete?(event: React.MouseEvent): void;
  handleEdit?(event: React.MouseEvent): void;
}

export const QuestionCard: React.FunctionComponent<QuestionCardProps> = ({ question, index = 0, handleDelete = () => {}, handleEdit = () => {} }: QuestionCardProps) => {
  const classes = useStyles();

  return (
    <div className={classnames("question-container", classes.greenBorder)}>
      <div className={classnames("question-index", classes.greenBackground)}>
        <DragIndicatorIcon style={{ height: "1rem" }} />
        {index + 1}
      </div>
      <div className="question-content">
        <p>{question}</p>
      </div>
      <div className="question-actions">
        <StyledDeleteButton aria-label="edit" size="small" color="secondary" style={{ marginRight: "0.6rem" }} onClick={handleEdit}>
          <EditIcon />
        </StyledDeleteButton>
        <StyledDeleteButton aria-label="delete" size="small" color="secondary" onClick={handleDelete}>
          <DeleteIcon />
        </StyledDeleteButton>
      </div>
    </div>
  );
};
