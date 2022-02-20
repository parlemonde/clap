import { useQuery, QueryFunction, useQueryCache } from "react-query";
import React from "react";

import { UserServiceContext } from "src/services/UserService";
import { serializeToQueryUrl } from "src/util";
import type { Theme } from "types/models/theme.type";

export const useThemes = (
  args: {
    user?: boolean;
    isDefault?: boolean;
  } = {},
): { themes: Theme[]; setThemes(themes: Theme[]): void } => {
  const queryCache = useQueryCache();
  const { axiosLoggedRequest } = React.useContext(UserServiceContext);
  const getThemes: QueryFunction<Theme[]> = React.useCallback(async () => {
    const response = await axiosLoggedRequest({
      method: "GET",
      url: `/themes${serializeToQueryUrl(args)}`,
    });
    if (response.error) {
      return [];
    }
    const localThemes: Theme[] = args.user === false ? JSON.parse(localStorage.getItem("themes") || "[]") || [] : [];
    return [...response.data, ...localThemes];
  }, [args, axiosLoggedRequest]);
  const { data, isLoading, error } = useQuery<Theme[], unknown>(["themes", args], getThemes);

  const setThemes = React.useCallback(
    (themes: Theme[]) => {
      queryCache.setQueryData(["themes", args], themes);
    },
    [args, queryCache],
  );
  return {
    themes: isLoading || error ? [] : data || [],
    setThemes,
  };
};

export const useThemeRequests = (): {
  createTheme(args: { newTheme: Theme; isAdmin?: boolean }): Promise<Theme | null>;
} => {
  const { isLoggedIn, axiosLoggedRequest } = React.useContext(UserServiceContext);
  const createTheme = React.useCallback(
    async (args: { newTheme: Theme; isAdmin?: boolean }) => {
      if (isLoggedIn) {
        const response = await axiosLoggedRequest({
          method: "POST",
          url: "/themes",
          data: {
            ...args.newTheme,
            userId: args.isAdmin ? undefined : true,
          },
        });
        if (response.error) {
          console.error(console.error);
          return null;
        }
        args.newTheme.id = response.data.id;
      } else {
        const localThemes = JSON.parse(localStorage.getItem("themes") || "[]") || [];
        args.newTheme.id = `local_${localThemes.length + 1}`;
        localThemes.push(args.newTheme);
        localStorage.setItem("themes", JSON.stringify(localThemes));
      }
      return args.newTheme;
    },
    [isLoggedIn, axiosLoggedRequest],
  );

  return { createTheme };
};

export type ThemeNames = { [key: number]: { [key: string]: string } };

export const useThemeNames = (): { themeNames: ThemeNames } => {
  const { themes } = useThemes({ isDefault: true });
  const themeNames = React.useMemo(() => {
    return themes.reduce((acc: ThemeNames, theme: Theme) => {
      acc[theme.id as number] = theme.names;
      return acc;
    }, {});
  }, [themes]);

  return { themeNames };
};
