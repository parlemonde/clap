import { useQuery, QueryFunction } from "react-query";
import React from "react";

import { UserServiceContext } from "src/services/UserService";
import type { Project } from "types/models/project.type";

export const useProjects = (): { projects: Project[] } => {
  const { user, isLoggedIn, axiosLoggedRequest } = React.useContext(UserServiceContext);
  const getProjects: QueryFunction<Project[]> = React.useCallback(async () => {
    if (!isLoggedIn) {
      return [];
    }
    const response = await axiosLoggedRequest({
      method: "GET",
      url: `/projects`,
    });
    if (response.error) {
      return [];
    }
    return response.data;
  }, [isLoggedIn, axiosLoggedRequest]);
  const { data, isLoading, error } = useQuery<Project[], unknown>(["projects", { userId: user?.id || 0 }], getProjects);
  return {
    projects: isLoading || error ? [] : data || [],
  };
};
