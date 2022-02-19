import { useRouter } from "next/router";
import React from "react";

import Typography from "@mui/material/Typography";

import { Inverted } from "src/components/Inverted";
import { Trans } from "src/components/Trans";
import { ScenarioCard } from "src/components/create/ScenarioCard";
import { Steps } from "src/components/create/Steps";
import { ThemeLink } from "src/components/create/ThemeLink";
import { useTranslation } from "src/i18n/useTranslation";
import { UserServiceContext } from "src/services/UserService";
import { ProjectServiceContext } from "src/services/useProject";
import { useScenarios } from "src/services/useScenarios";

const ScenarioChoice: React.FunctionComponent = () => {
  const router = useRouter();
  const { t, currentLocale } = useTranslation();
  const { isLoggedIn } = React.useContext(UserServiceContext);
  const { project } = React.useContext(ProjectServiceContext);
  const { scenarios } = useScenarios({
    getQuestionsCount: true,
    user: isLoggedIn,
    isDefault: true,
    languageCode: currentLocale,
    themeId: project.theme?.id || null,
  });

  const handleScenarioClick = (path: string): void => {
    router.push(path);
  };

  return (
    <div>
      <ThemeLink />
      <Steps activeStep={0} />
      <div style={{ maxWidth: "1000px", margin: "auto", paddingBottom: "2rem" }}>
        <Typography color="primary" variant="h1">
          <Inverted round>1</Inverted>{" "}
          <Trans i18nKey="part1_title">
            Quel <Inverted>scénario</Inverted> choisir ?
          </Trans>
        </Typography>
        <Typography color="inherit" variant="h2">
          {t("part1_subtitle2")}
        </Typography>
        <div className="scenarios-container">
          <ScenarioCard scenario={{ id: "new", languageCode: "fr", isDefault: true, name: t("new_scenario_card_title"), description: t("new_scenario_card_desc"), questionsCount: 0, user: null }} isNew onClick={handleScenarioClick} />
          {scenarios.map((scenario, index) => (
            <ScenarioCard scenario={scenario} onClick={handleScenarioClick} key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScenarioChoice;
