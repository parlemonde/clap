import classNames from "classnames";
import React from "react";

import NavigationIcon from "@mui/icons-material/Navigation";
import Fab from "@mui/material/Fab";

export const ScrollTopButton: React.FC = () => {
  const [showScroll, setShowScroll] = React.useState(false);
  const checkScrollTop = () => {
    if (!showScroll && window.pageYOffset > 100) {
      setShowScroll(true);
    } else if (showScroll && window.pageYOffset <= 100) {
      setShowScroll(false);
    }
  };

  React.useEffect(() => {
    window.addEventListener("scroll", checkScrollTop);
    return () => {
      window.removeEventListener("scroll", checkScrollTop);
    };
  });

  return (
    <Fab
      size="medium"
      color="primary"
      aria-label="add"
      className={classNames("navigate-top-button", { "navigate-top-button--visible": showScroll })}
      onClick={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      <NavigationIcon />
    </Fab>
  );
};
