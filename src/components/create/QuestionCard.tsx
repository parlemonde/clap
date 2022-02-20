import React from "react";

import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";

interface QuestionCardProps {
  question: string;
  index?: number;
  handleDelete?(event: React.MouseEvent): void;
  handleEdit?(event: React.MouseEvent): void;
}

export const QuestionCard: React.FunctionComponent<QuestionCardProps> = ({
  question,
  index = 0,
  handleDelete = () => {},
  handleEdit = () => {},
}: QuestionCardProps) => {
  return (
    <Box sx={{ border: "1px solid", borderColor: (theme) => theme.palette.secondary.main }} className="question-container">
      <Box sx={{ backgroundColor: (theme) => theme.palette.secondary.main }} className="question-index">
        <DragIndicatorIcon style={{ height: "1rem" }} />
        {index + 1}
      </Box>
      <div className="question-content">
        <p>{question}</p>
      </div>
      <div className="question-actions">
        <IconButton
          sx={{ border: "1px solid", borderColor: (theme) => theme.palette.secondary.main }}
          aria-label="edit"
          size="small"
          color="secondary"
          style={{ marginRight: "0.6rem" }}
          onClick={handleEdit}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          sx={{ border: "1px solid", borderColor: (theme) => theme.palette.secondary.main }}
          aria-label="delete"
          size="small"
          color="secondary"
          onClick={handleDelete}
        >
          <DeleteIcon />
        </IconButton>
      </div>
    </Box>
  );
};
