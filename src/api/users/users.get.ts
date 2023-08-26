import type { QueryFunction, UseQueryOptions } from 'react-query';
import { useQuery } from 'react-query';

import { httpRequest } from 'src/utils/http-request';
import type { User } from 'types/models/user.type';

type GETResponse = User | undefined;
type GETParams = number;
type GETError = never;
type GETQueryKey = [string, GETParams];

export const getUser: QueryFunction<GETResponse, GETQueryKey> = async ({ queryKey }) => {
    const [, userId] = queryKey;
    const response = await httpRequest<User>({
        method: 'GET',
        url: `/users/${userId}`,
    });
    if (response.success) {
        return response.data;
    }
    return undefined;
};

export const useUser = (userId: number, options?: UseQueryOptions<GETResponse, GETError, GETResponse, GETQueryKey>) => {
    const { data, isLoading } = useQuery(['user', userId], getUser, options);
    return {
        user: data,
        isLoading,
    };
};
