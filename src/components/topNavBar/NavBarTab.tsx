import { useRouter } from "next/router";
import React from "react";

import Tab from "@mui/material/Tab";

import { useTranslation } from "src/i18n/useTranslation";

export interface NavBarTabProps {
  label: string;
  path: string;
  icon?: JSX.Element;
}
export interface TabOwnProps {
  selected?: boolean;
  style?: React.CSSProperties;
}

const NavBarTab: React.FunctionComponent<NavBarTabProps & TabOwnProps> = ({
  label,
  path,
  icon = <span />,
  style = {},
  selected = false,
}: NavBarTabProps & TabOwnProps) => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Tab
      sx={{
        fill: "#fff",
        fontFamily: "'Alegreya Sans', sans-serif",
        fontSize: "1.2rem",
        fontWeight: "bold",
        margin: "6px 12px",
        minHeight: "36px",
        opacity: 1,
        padding: "0 0.5rem",
        textTransform: "none",
        "&.selected": {
          backgroundColor: "#fff",
          color: (theme) => theme.palette.primary.main,
          fill: (theme) => theme.palette.primary.main,
        },
      }}
      component="a"
      onClick={(event: React.SyntheticEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        router.push(path);
      }}
      href={path}
      label={
        <span className="tab-label">
          {t(label)}
          {icon}
        </span>
      }
      aria-controls={`top-navbar-tab-${label}`}
      id={`top-navbar-tab-${label}`}
      style={style}
      className={selected ? "selected" : ""}
    />
  );
};

export default NavBarTab;
