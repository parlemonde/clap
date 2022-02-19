import { useRouter } from "next/router";
import React, { useEffect } from "react";

import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import BottomNavigation from "@mui/material/BottomNavigation";
import Box from "@mui/material/Box";
import { Theme as MaterialTheme } from "@mui/material/styles";

import { useTranslation } from "src/i18n/useTranslation";
import { UserServiceContext } from "src/services/UserService";
import { getTabs } from "src/util/tabs";

const BottomNavigationActionSx = {
  fill: "#808080",
  color: "#808080",
  "&.Mui-selected": {
    fill: (theme: MaterialTheme) => theme.palette.secondary.main,
    color: (theme: MaterialTheme) => theme.palette.secondary.main,
  },
};

export const BottomNavBar: React.FunctionComponent = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isLoggedIn } = React.useContext(UserServiceContext);
  const [activeTab, setActiveTab] = React.useState(0);

  const tabs = getTabs(isLoggedIn, user && user.type === 2, false);

  useEffect(() => {
    const navtabs = getTabs(isLoggedIn, user && user.type === 2, false);
    const index = navtabs.reduce((i1, tab, i2) => (tab.path.split("/")[1] === router.pathname.split("/")[1] ? i2 : i1), -1);
    setActiveTab(index + 1);
  }, [user, isLoggedIn, router.pathname]);

  return (
    <Box sx={{ display: { md: "none", xs: "block" } }}>
      <div style={{ height: "60px" }} />
      <BottomNavigation
        value={activeTab}
        onChange={(_event, newValue) => {
          setActiveTab(newValue);
        }}
        showLabels
        className="bottom-navbar"
      >
        <BottomNavigationAction sx={BottomNavigationActionSx} label="" style={{ display: "none" }} />
        {tabs.map((tab, index) => (
          <BottomNavigationAction
            sx={BottomNavigationActionSx}
            label={t(tab.label)}
            icon={tab.icon}
            key={index}
            onClick={(event: React.MouseEvent) => {
              event.preventDefault();
              router.push(tab.path);
            }}
          />
        ))}
      </BottomNavigation>
    </Box>
  );
};
