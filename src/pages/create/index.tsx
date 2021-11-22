import { useRouter } from "next/router";
import React from "react";

import Typography from "@material-ui/core/Typography";

import { Inverted } from "src/components/Inverted";
import { Trans } from "src/components/Trans";
import { ThemeCard } from "src/components/create/ThemeCard";
import { UserServiceContext } from "src/services/UserService";
import { ProjectServiceContext } from "src/services/useProject";
import { useThemes } from "src/services/useThemes";

const Create: React.FunctionComponent = () => {
  const router = useRouter();
  const { updateProject } = React.useContext(ProjectServiceContext);
  const { isLoggedIn } = React.useContext(UserServiceContext);
  const { themes } = useThemes({ user: isLoggedIn, isDefault: true });

  const handleThemeClick =
    (index: number) =>
    (path: string): void => {
      if (index >= 0) {
        updateProject({
          theme: themes[index],
        });
      }
      router.push(path);
    };

  return (
    <>
      <Typography color="primary" variant="h1">
        <Trans i18nKey="create_theme_title">
          Sur quel <Inverted>thème</Inverted> sera votre vidéo ?
        </Trans>
      </Typography>
      <div className="theme-cards-container">
        <div key="new">
          <ThemeCard onClick={handleThemeClick(-1)} />
        </div>
        {themes.map((t, index) => (
          <div key={index}>
            <ThemeCard {...t} onClick={handleThemeClick(index)} />
          </div>
        ))}
      </div>
    </>
  );
};

export default Create;
