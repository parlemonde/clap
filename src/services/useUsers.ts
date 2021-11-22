import { useQuery, useQueryCache } from "react-query";
import React from "react";

import { axiosRequest } from "src/util/axiosRequest";
import { serializeToQueryUrl } from "src/util";
import type { User } from "types/models/user.type";

export interface UserArgs {
  limit?: number;
  page?: number;
  order?: "id" | "email" | "pseudo" | "school" | "level";
  sort?: "asc" | "desc";
  search?: string;
}

export const useUsers = (args: UserArgs = {}): { users: User[]; count: number } => {
  const prevArgs = React.useRef<UserArgs>({});
  const queryCache = useQueryCache();
  React.useEffect(() => {
    prevArgs.current = args;
  });

  const getUsers: () => Promise<User[]> = React.useCallback(async () => {
    const response = await axiosRequest({
      method: "GET",
      url: `/users${serializeToQueryUrl(args)}`,
    });
    if (response.error) {
      return [];
    }
    return response.data;
  }, [args]);

  const { data, isLoading, error } = useQuery<User[], unknown>(["users", args], getUsers);
  const {
    data: count,
    isLoading: isLoading2,
    error: error2,
  } = useQuery<number, unknown>(["users", "count"], async () => {
    const response = await axiosRequest({
      method: "GET",
      url: `/users/count`,
    });
    if (response.error) {
      return 0;
    }
    return response.data.userCount || 0;
  });

  const prevUsers: User[] = queryCache.getQueryData(["users", prevArgs.current]) || [];
  return { users: isLoading || error ? prevUsers : data, count: isLoading2 || error2 ? 0 : count };
};
