import { useRouter } from "next/router";
import qs from "query-string";
import React from "react";

import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { NoSsr } from "@mui/material";
import { Backdrop, CircularProgress } from "@mui/material";

import { useTranslation } from "src/i18n/useTranslation";
import { UserServiceContext } from "src/services/UserService";
import { ssoHost, ssoHostName, clientId, generateTemporaryToken } from "src/util";

const errorMessages = {
  0: "login_unknown_error",
  1: "login_username_error",
  2: "login_password_error",
  3: "login_account_error",
  5: `Veuillez utiliser le login avec ${ssoHostName} pour votre compte`,
  6: "Veuillez utiliser le login par email/mot de passe pour votre compte",
};

const isRedirectValid = (redirect: string): boolean => {
  // inner redirection.
  if (redirect.startsWith("/")) {
    return true;
  }
  // external, allow only same domain.
  try {
    const url = new URL(redirect);
    return url.hostname.slice(-15) === ".parlemonde.org";
  } catch {
    return false;
  }
};

const Login: React.FunctionComponent = () => {
  const { t } = useTranslation();
  const { login, loginWithSso } = React.useContext(UserServiceContext);
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const [showPassword, setShowPassword] = React.useState(false);
  const [user, setUser] = React.useState({
    username: "",
    password: "",
    remember: false,
  });
  const [errorCode, setErrorCode] = React.useState(-1);
  const redirect = React.useRef<string>("/create");

  const firstCall = React.useRef(false);
  const loginSSO = React.useCallback(
    async (code: string) => {
      if (firstCall.current === false) {
        firstCall.current = true;
        setIsLoading(true);
        const response = await loginWithSso(code);
        if (response.success) {
          router.push(isRedirectValid(redirect.current) ? redirect.current : "/");
        } else {
          setErrorCode(response.errorCode || 0);
        }
        setIsLoading(false);
      }
    },
    [loginWithSso, router],
  );

  React.useEffect(() => {
    const urlQueryParams = qs.parse(window.location.search);
    try {
      redirect.current = decodeURI((urlQueryParams.redirect as string) || "/create");
    } catch (e) {
      redirect.current = "/create";
    }
    if (urlQueryParams.state && urlQueryParams.code) {
      const state = window.sessionStorage.getItem("oauth-state") || "";
      if (state === decodeURI(urlQueryParams.state as string)) {
        loginSSO(decodeURI(urlQueryParams.code as string)).catch();
      } else {
        setErrorCode(0);
      }
    }
  }, [loginSSO]);

  const handleUserNameInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, username: event.target.value });
    if (errorCode === 1) {
      setErrorCode(-1);
    }
  };

  const handlePasswordInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, password: event.target.value });
    if (errorCode === 2) {
      setErrorCode(-1);
    }
  };

  const handleToggleLocalSave = () => {
    setUser({ ...user, remember: !user.remember });
  };

  const handleToggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const submit = async (event: React.MouseEvent) => {
    event.preventDefault();
    setErrorCode(-1);
    const response = await login(user.username, user.password, user.remember);
    if (response.success) {
      router.push(isRedirectValid(redirect.current) ? redirect.current : "/create");
    } else {
      setErrorCode(response.errorCode || 0);
    }
  };

  const loginSso = () => {
    if (!clientId || !ssoHost) {
      return;
    }
    setIsLoading(true);
    const state = generateTemporaryToken();
    window.sessionStorage.setItem("oauth-state", state);
    const url = `${ssoHost}/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${window.location.href.split("?")[0]}&state=${state}`;
    window.location.replace(url);
  };

  const handleLinkClick = (path: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    router.push(path);
  };

  return (
    <div className="text-center">
      <Typography color="primary" variant="h1" style={{ marginTop: "2rem" }}>
        {t("login_title")}
      </Typography>
      <form className="login-form" noValidate>
        {(errorCode === 0 || errorCode >= 3) && (
          <Typography variant="caption" color="error">
            {t(errorMessages[errorCode as 0] || errorMessages[0])}
          </Typography>
        )}
        <NoSsr>
          {ssoHost.length && clientId ? (
            <>
              <Button variant="contained" color="secondary" onClick={loginSso} style={{ margin: "1.5rem 0" }}>
                Se connecter avec {ssoHostName}
              </Button>
              <div className="login__divider">
                <div className="login__or">
                  <span style={{ fontSize: "1.2rem", padding: "0.25rem", backgroundColor: "white" }}>OU</span>
                </div>
              </div>
            </>
          ) : null}
        </NoSsr>
        <TextField
          id="username"
          name="username"
          type="text"
          color="secondary"
          label={t("login_username")}
          value={user.username}
          onChange={handleUserNameInputChange}
          variant="outlined"
          fullWidth
          error={errorCode === 1}
          helperText={errorCode === 1 ? t(errorMessages[1]) : null}
        />
        <TextField
          type={showPassword ? "text" : "password"}
          color="secondary"
          id="password"
          name="password"
          label={t("login_password")}
          value={user.password}
          onChange={handlePasswordInputChange}
          variant="outlined"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton aria-label="toggle password visibility" onClick={handleToggleShowPassword} edge="end">
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          fullWidth
          error={errorCode === 2}
          helperText={errorCode === 2 ? t(errorMessages[2]) : null}
        />
        <div>
          <FormControlLabel control={<Checkbox checked={user.remember} onChange={handleToggleLocalSave} value={user.remember} />} label={t("login_remember_me")} />
        </div>
        <Button variant="contained" color="secondary" type="submit" value="Submit" onClick={submit}>
          {t("login_connect")}
        </Button>
        <div className="text-center">
          <Link href="/reset-password" onClick={handleLinkClick("/reset-password")}>
            {t("login_forgot_password")}
          </Link>
        </div>
        <div className="text-center">
          {t("login_new")}{" "}
          <Link href="/signup" onClick={handleLinkClick("/sign-up")}>
            {t("login_signup")}
          </Link>
        </div>
      </form>
      <Backdrop style={{ zIndex: 2000, color: "white" }} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
};

export default Login;
