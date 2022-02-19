import React from "react";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Typography from "@mui/material/Typography";

import { useTranslation } from "src/i18n/useTranslation";
import { useLanguages } from "src/services/useLanguages";
import { setCookie } from "src/util/cookies";

const Settings: React.FunctionComponent = () => {
  const { t, currentLocale } = useTranslation();

  const [currentLanguage, setCurrentLanguage] = React.useState<string | null>(null);
  const { languages } = useLanguages();

  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    setCurrentLanguage(event.target.value);
    setCookie("app-language", event.target.value, {
      "max-age": 24 * 60 * 60,
    });
    window.location.reload();
  };

  return (
    <div className="text-center">
      <form className="login-form" noValidate autoComplete="off" style={{ margin: "1rem 0" }}>
        <Typography color="primary" variant="h1" style={{ width: "100%", textAlign: "left", marginBottom: "2rem" }}>
          {t("settings")}
        </Typography>
        {languages.length > 0 && (
          <>
            <Typography color="inherit" variant="h2" style={{ width: "100%", textAlign: "left", margin: "0.5rem 0 1rem 0" }}>
              {t("change_language")}
            </Typography>
            <FormControl variant="outlined" style={{ minWidth: "15rem" }} className="mobile-full-width">
              <InputLabel htmlFor="language">{t("language")}</InputLabel>
              <Select
                native
                value={currentLanguage || currentLocale}
                onChange={handleLanguageChange}
                label={t("language")}
                inputProps={{
                  name: "language",
                  id: "language",
                }}
              >
                {languages.map((l) => (
                  <option value={l.value} key={l.value}>
                    {l.label}
                  </option>
                ))}
              </Select>
            </FormControl>
          </>
        )}
      </form>
    </div>
  );
};

export default Settings;
