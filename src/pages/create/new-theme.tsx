import { useRouter } from "next/router";
import { useMutation, useQueryCache } from "react-query";
import React from "react";

import ArrowForwardIcon from "@mui/icons-material/ArrowForwardIos";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import Hidden from "@mui/material/Hidden";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { Inverted } from "src/components/Inverted";
import { Trans } from "src/components/Trans";
import { useTranslation } from "src/i18n/useTranslation";
import { ProjectServiceContext } from "src/services/useProject";
import { useThemeRequests } from "src/services/useThemes";

const NewTheme: React.FunctionComponent = () => {
  const router = useRouter();
  const queryCache = useQueryCache();
  const { t, currentLocale } = useTranslation();
  const { updateProject } = React.useContext(ProjectServiceContext);
  const { createTheme } = useThemeRequests();
  const [mutate] = useMutation(createTheme);
  const [themeName, setThemeName] = React.useState("");
  const [hasError, setHasError] = React.useState(false);

  const handleHome = (event: React.MouseEvent) => {
    event.preventDefault();
    router.push("/create");
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setThemeName(event.target.value);
    setHasError(false);
  };

  const handleSubmit = async () => {
    if (themeName.length === 0) {
      setHasError(true);
      return;
    }
    try {
      const newTheme = await mutate({
        newTheme: {
          id: 0,
          order: 0,
          image: null,
          names: {
            fr: themeName,
            [currentLocale]: themeName,
          },
          isDefault: false,
        },
      });
      if (newTheme === null) {
        // TODO
        return;
      }
      queryCache.invalidateQueries("themes");
      updateProject({
        theme: newTheme,
      });
      router.push(`/create/1-scenario-choice`);
    } catch (e) {
      // TODO
    }
  };

  return (
    <div>
      <Hidden smDown implementation="css">
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
          <Link color="inherit" href="/create" onClick={handleHome}>
            {t("all_themes")}
          </Link>
          <Typography color="textPrimary">{t("create_new_theme")}</Typography>
        </Breadcrumbs>
      </Hidden>

      <div
        style={{
          maxWidth: "1000px",
          margin: "auto",
          paddingBottom: "2rem",
        }}
      >
        <Hidden mdUp implementation="css">
          <Button size="medium" onClick={handleHome} style={{ paddingLeft: "0!important", margin: "1rem 0 0 0" }}>
            <KeyboardArrowLeft />
            {t("back")}
          </Button>
        </Hidden>
        <Typography color="primary" variant="h1" style={{ marginTop: "1rem" }}>
          <Trans i18nKey="new_theme_title">
            Créer votre <Inverted>thème</Inverted> :
          </Trans>
        </Typography>
        <Typography color="inherit" variant="h2">
          <Trans i18nKey="new_theme_title_label">
            Nom du thème<span style={{ color: "red" }}>*</span> :
          </Trans>
          <div>
            <TextField
              value={themeName}
              onChange={handleInputChange}
              required
              error={hasError}
              className={hasError ? "shake" : ""}
              id="themeName"
              placeholder={t("new_theme_title_placeholder")}
              fullWidth
              style={{ marginTop: "0.5rem" }}
              variant="outlined"
              color="secondary"
              autoComplete="off"
            />
          </div>
        </Typography>

        <div style={{ marginTop: "2rem" }}>
          <Hidden smDown implementation="css">
            <div style={{ width: "100%", textAlign: "right" }}>
              <Button component="a" variant="outlined" color="secondary" style={{ marginRight: "1rem" }} href={`/create`} onClick={handleHome}>
                {t("cancel")}
              </Button>
              <Button variant="contained" color="secondary" onClick={handleSubmit} endIcon={<ArrowForwardIcon />}>
                {t("next")}
              </Button>
            </div>
          </Hidden>
          <Hidden mdUp implementation="css">
            <Button variant="contained" color="secondary" style={{ width: "100%", marginTop: "2rem" }} onClick={handleSubmit}>
              {t("next")}
            </Button>
          </Hidden>
        </div>
      </div>
    </div>
  );
};

export default NewTheme;
