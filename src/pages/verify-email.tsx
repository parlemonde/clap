import { useRouter } from "next/router";
import React from "react";

import { Backdrop, CircularProgress } from "@mui/material";

import { UserServiceContext } from "src/services/UserService";

const VerifyEmail: React.FunctionComponent = () => {
  const router = useRouter();
  const { verifyEmail } = React.useContext(UserServiceContext);
  const [user] = React.useState({
    email: (router.query.email as string) || "",
    verifyToken: (router.query["verify-token"] as string) || "",
  });

  const submit = React.useCallback(async () => {
    if (user.email.length === 0 || user.verifyToken.length === 0) {
      router.push("/create");
      return;
    }
    await verifyEmail(user);
    router.push("/create");
  }, [router, user, verifyEmail]);

  React.useEffect(() => {
    submit().catch();
  }, [submit]);

  return (
    <div className="text-center">
      <Backdrop
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          color: "#fff",
        }}
        open={true}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
};

export default VerifyEmail;
