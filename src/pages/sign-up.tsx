import { useRouter } from "next/router";
import qs from "query-string";
import React from "react";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Theme } from "@mui/material/styles";
import { Link, Typography, Backdrop, CircularProgress, InputAdornment, IconButton, TextField, Button, FormControl, InputLabel, Select /*, TextFieldProps */ } from "@mui/material";
import { makeStyles } from "@mui/styles";

// import Autocomplete from "@material-ui/lab/Autocomplete";
import { useTranslation } from "src/i18n/useTranslation";
import { UserServiceContext } from "src/services/UserService";
import { useLanguages } from "src/services/useLanguages";
import { axiosRequest } from "src/util/axiosRequest";
import { getQueryString } from "src/util";
import type { User } from "types/models/user.type";

const useStyles = makeStyles((theme: Theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
}));

// eslint-disable-next-line no-control-regex
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/i;
const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
// const frenchClasses = ["CP", "CE1", "CE2", "CM1", "CM2"];

const checks = {
  email: (value: string) => emailRegex.test(value),
  pseudo: (value: string) => value.length > 0,
  password: (value: string) => strongPassword.test(value),
  passwordConfirm: (value: string, user: User) => value === user.password,
};

const isPseudoAvailable = async (pseudo: string): Promise<boolean> => {
  const response = await axiosRequest({
    method: "GET",
    url: `/users/test-pseudo/${pseudo}`,
  });
  if (response.error) {
    return false;
  }
  return response.data.available;
};

const checkInviteCode = async (code: string): Promise<boolean> => {
  const response = await axiosRequest({
    method: "GET",
    url: `/users/check-invite/${code}`,
  });
  if (response.error) {
    return false;
  }
  return response.data.isValid;
};

const Signup: React.FunctionComponent = () => {
  const classes = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const { isLoggedIn, signup } = React.useContext(UserServiceContext);
  const { languages } = useLanguages();
  const [user, setUser] = React.useState<User>({
    id: 0,
    languageCode: "fr",
    email: "",
    level: "",
    pseudo: "",
    school: "",
    type: 0,
    accountRegistration: 0,
    password: "",
    passwordConfirm: "",
  });
  const [errors, setErrors] = React.useState({
    email: false,
    pseudo: false,
    pseudoNotAvailable: false,
    password: false,
    passwordConfirm: false,
    global: false,
  });
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [inviteCode, setInviteCode] = React.useState<string | null>(null);
  const [inviteCodeValue, setInviteCodeValue] = React.useState<string>("");
  const [inviteCodeError, setInviteCodeError] = React.useState<boolean>(false);
  const inviteCodeURL = getQueryString(router.query.inviteCode) || "";

  const handleLinkClick = (path: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    router.push(path);
  };

  const handleSubmit = async (event: React.MouseEvent) => {
    event.preventDefault();
    setLoading(true);
    // Check form validity
    const userKeys: Array<"email" | "pseudo" | "password" | "passwordConfirm"> = ["email", "pseudo", "password", "passwordConfirm"];
    let isFormValid = true;
    for (const userKey of userKeys) {
      if (!checks[userKey](user[userKey], user)) {
        isFormValid = false;
        setErrors((e) => ({ ...e, [userKey]: true }));
      }
    }
    if (user.pseudo.length !== 0 && !(await isPseudoAvailable(user.pseudo))) {
      isFormValid = false;
      setErrors((e) => ({ ...e, pseudoNotAvailable: true }));
    }
    if (!isFormValid) {
      setErrors((e) => ({ ...e, global: true }));
      window.scrollTo(0, 0);
      setLoading(false);
      return;
    }
    const response = await signup(user, inviteCode);
    setLoading(false);
    if (response.success) {
      router.push("/create");
    } else {
      console.error(response.errorCode);
    }
  };

  const handleInviteCodeSubmit = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (!(await checkInviteCode(inviteCodeValue))) {
      setInviteCodeError(true);
      return;
    }
    setInviteCode(inviteCodeValue);
  };

  const handleInviteFromURL = React.useCallback(async (code: string) => {
    if (code.length > 0) {
      if (!(await checkInviteCode(code))) {
        setInviteCodeValue(code);
        setInviteCodeError(true);
        return;
      }
      setInviteCode(code);
    }
  }, []);

  const onInviteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value.startsWith("http://") || value.startsWith("https://")) {
      setInviteCodeValue(getQueryString(qs.parseUrl(value).query.inviteCode) || value);
    } else {
      setInviteCodeValue(value);
    }
    setInviteCodeError(false);
  };

  const handleInputChange = (userKey: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [userKey]: event.target.value });
    setErrors((e) => ({ ...e, [userKey]: false, global: false }));
  };
  const handleInputValidations = (userKey: "email" | "pseudo" | "password" | "passwordConfirm") => (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value || "";
    setErrors((e) => ({
      ...e,
      [userKey]: value.length !== 0 && !checks[userKey](value, user),
    }));
    if (userKey === "pseudo" && value.length !== 0) {
      isPseudoAvailable(value).then((result: boolean) => {
        setErrors((e) => ({ ...e, pseudoNotAvailable: !result }));
      });
    }
  };

  React.useEffect(() => {
    handleInviteFromURL(inviteCodeURL).catch();
  }, [inviteCodeURL, handleInviteFromURL]);

  React.useEffect(() => {
    if (isLoggedIn) {
      router.push("/create");
    }
  }, [isLoggedIn, router]);
  if (isLoggedIn) {
    return null;
  }

  return (
    <div className="text-center">
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Typography color="primary" variant="h1" style={{ marginTop: "2rem" }}>
        {t("signup_title")}
      </Typography>

      {inviteCode === null ? (
        <form className="signup-form" noValidate autoComplete={"off"} style={{ textAlign: "left" }}>
          <label style={{ fontWeight: "bold", fontSize: "1rem" }}>{t("signup_invite_title")}</label>
          <TextField
            id="inviteCode"
            name="inviteCode"
            type="text"
            color="secondary"
            label={t("signup_invite_placeholder")}
            value={inviteCodeValue}
            onChange={onInviteChange}
            variant="outlined"
            fullWidth
            error={inviteCodeError}
            helperText={inviteCodeError ? t("signup_invite_error") : ""}
            style={{ marginTop: "1rem" }}
          />
          <Button variant="contained" color="secondary" type="submit" value="Submit" onClick={handleInviteCodeSubmit}>
            {t("continue")}
          </Button>
        </form>
      ) : (
        <form className="signup-form" noValidate autoComplete={"off"}>
          {errors.global && (
            <Typography variant="caption" color="error">
              {t("signup_error_msg")}
            </Typography>
          )}
          <TextField
            id="email"
            name="email"
            type="email"
            color="secondary"
            label={t("signup_email")}
            value={user.email || ""}
            onChange={handleInputChange("email")}
            onBlur={handleInputValidations("email")}
            variant="outlined"
            fullWidth
            error={errors.email}
            helperText={errors.email ? t("signup_email_error") : ""}
          />
          <TextField
            id="username"
            name="username"
            type="text"
            color="secondary"
            label={t("signup_pseudo")}
            value={user.pseudo || ""}
            onChange={handleInputChange("pseudo")}
            onBlur={handleInputValidations("pseudo")}
            variant="outlined"
            fullWidth
            error={errors.pseudo || errors.pseudoNotAvailable}
            helperText={(errors.pseudo ? `${t("signup_required")} | ` : errors.pseudoNotAvailable ? `${t("signup_pseudo_error")} |` : "") + t("signup_pseudo_help")}
          />
          {/* <TextField id="school" name="school" type="text" color="secondary" label={t("signup_school")} value={user.school || ""} onChange={handleInputChange("school")} variant="outlined" fullWidth />
          <Autocomplete
            id="classe"
            freeSolo
            options={frenchClasses}
            onSelect={handleInputChange("level")}
            renderInput={(params: TextFieldProps) => <TextField {...params} label={t("signup_level")} value={user.level || ""} onChange={handleInputChange("level")} variant="outlined" color="secondary" />}
          /> */}
          <FormControl variant="outlined" color="secondary">
            <InputLabel htmlFor="languageCode">{t("signup_language")}</InputLabel>
            <Select
              native
              value={user.languageCode}
              onChange={handleInputChange("languageCode")}
              label={t("signup_language")}
              inputProps={{
                name: "languageCode",
                id: "languageCode",
              }}
            >
              {languages.map((l) => (
                <option value={l.value} key={l.value}>
                  {l.label}
                </option>
              ))}
            </Select>
          </FormControl>
          <TextField
            type={showPassword ? "text" : "password"}
            color="secondary"
            id="password"
            name="password"
            label={t("login_password")}
            value={user.password || ""}
            onChange={handleInputChange("password")}
            onBlur={handleInputValidations("password")}
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => {
                      setShowPassword(!showPassword);
                    }}
                    edge="end"
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            fullWidth
            error={errors.password}
            helperText={errors.password ? t("signup_password_error") : ""}
          />
          <TextField
            type={showPassword ? "text" : "password"}
            color="secondary"
            id="passwordComfirm"
            name="passwordComfirm"
            label={t("signup_password_confirm")}
            value={user.passwordConfirm || ""}
            onChange={handleInputChange("passwordConfirm")}
            onBlur={handleInputValidations("passwordConfirm")}
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => {
                      setShowPassword(!showPassword);
                    }}
                    edge="end"
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            fullWidth
            error={errors.passwordConfirm}
            helperText={errors.passwordConfirm ? t("signup_password_confirm_error") : ""}
          />
          <Button variant="contained" color={"secondary"} type="submit" value="Submit" onClick={handleSubmit}>
            {t("signup_button")}
          </Button>
        </form>
      )}

      <div className="text-center" style={{ marginBottom: "2rem" }}>
        {t("signup_already")}{" "}
        <Link href="/login" onClick={handleLinkClick("/login")}>
          {t("login_connect")}
        </Link>
      </div>
    </div>
  );
};

export default Signup;
