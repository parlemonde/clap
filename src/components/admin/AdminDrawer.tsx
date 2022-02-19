import { useRouter } from "next/router";
import React from "react";

import Box from "@mui/material/Box";
import { Drawer, List, ListItem, ListItemText } from "@mui/material";

const DRAWER_WIDTH = 240;

interface Tab {
  label: string;
  path: string;
}

const adminTabs: Tab[] = [
  {
    label: "Thèmes",
    path: "/admin/themes",
  },
  {
    label: "Scénarios",
    path: "/admin/scenarios",
  },
  {
    label: "Questions",
    path: "/admin/questions",
  },
  {
    label: "Langues",
    path: "/admin/languages",
  },
  {
    label: "Utilisateurs",
    path: "/admin/users",
  },
  {
    label: "Statistiques",
    path: "/admin/statistics",
  },
];

export const AdminDrawer: React.FunctionComponent = () => {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  React.useEffect(() => {
    const index = adminTabs.reduce((i1: number, tab: Tab, i2: number) => (tab.path === router.pathname.slice(0, tab.path.length) ? i2 : i1), 0);
    setSelectedIndex(index);
  }, [router.pathname]);

  return (
    <Drawer
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          backgroundColor: "white",
        },
      }}
      variant="permanent"
    >
      <Box sx={(theme) => theme.mixins.toolbar} />
      <List>
        {adminTabs.map((tab, index) => (
          <ListItem
            component="a"
            button
            key={tab.label}
            href={tab.path}
            onClick={(event: React.MouseEvent) => {
              event.preventDefault();
              router.push(tab.path);
            }}
            selected={selectedIndex === index}
          >
            <ListItemText primary={tab.label} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};
