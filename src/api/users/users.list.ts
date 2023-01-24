import type { QueryFunction } from 'react-query';
import { useQuery } from 'react-query';

import { axiosRequest } from 'src/utils/axiosRequest';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';
import type { User } from 'types/models/user.type';

type GETResponse = { users: User[]; total: number };
export type GETParams = {
    page?: number;
    limit?: number;
    sort?: 'asc' | 'desc';
    order?: string;
    search?: string;
};
type GETQueryKey = [string, GETParams];

export const getUsers: QueryFunction<GETResponse, GETQueryKey> = async ({ queryKey }) => {
    const [, params] = queryKey;
    const response = await axiosRequest<GETResponse>({
        method: 'GET',
        url: `/users${serializeToQueryUrl(params)}`,
    });
    if (response.success) {
        return response.data;
    }
    return { users: [], total: 0 };
};

export const useUsers = (params: GETParams = {}) => {
    const { data, isLoading } = useQuery(['users', params], getUsers, {
        refetchOnWindowFocus: 'always',
    });
    return {
        users: data?.users || [],
        total: data?.total || 0,
        isLoading,
    };
};
