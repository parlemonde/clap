import { useRouter } from "next/router";
import React from "react";

import { Button, Typography } from "@mui/material";

const Custom404: React.FunctionComponent = () => {
  const router = useRouter();
  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    router.push("/create");
  };

  return (
    <div>
      <div className="text-center">
        <Typography color="primary" variant="h1" style={{ marginTop: "2rem" }}>
          Oups, cette page n&apos;existe pas !
        </Typography>
        <Button component="a" className="mobile-full-width" href="/" variant="contained" color="secondary" onClick={handleClick} style={{ marginTop: "3rem" }}>
          Revenir à l&apos;accueil
        </Button>
      </div>
    </div>
  );
};

export default Custom404;
