import React from "react";

import Paper from "@mui/material/Paper";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Theme as MaterialTheme } from "@mui/material/styles";
import { makeStyles, createStyles } from "@mui/styles";

interface AdminTileProps {
  title: string;
  selectLanguage?: React.ReactNode | null;
  children?: React.ReactNode | React.ReactNodeArray | null;
  toolbarButton?: React.ReactNode | null;
  style?: React.CSSProperties;
}

const useTableStyles = makeStyles((theme: MaterialTheme) =>
  createStyles({
    toolbar: {
      backgroundColor: theme.palette.secondary.main,
      color: "white",
      fontWeight: "bold",
      minHeight: "unset",
      padding: "8px 8px 8px 16px",
    },
    title: {
      flex: "1 1 100%",
      padding: "6px 0",
    },
  }),
);

export const AdminTile: React.FunctionComponent<AdminTileProps> = ({ title, children = null, toolbarButton = null, selectLanguage = null, style = {} }: AdminTileProps) => {
  const classes = useTableStyles();
  return (
    <Paper style={{ ...style, overflow: "hidden" }}>
      <Toolbar className={classes.toolbar}>
        <Typography variant="h2" id="themetabletitle" component="div" className={classes.title}>
          {title} {selectLanguage}
        </Typography>
        {toolbarButton}
      </Toolbar>
      {children}
    </Paper>
  );
};
