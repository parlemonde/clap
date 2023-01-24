import type { QueryFunction } from 'react-query';
import { useQuery } from 'react-query';

import { axiosRequest } from 'src/utils/axiosRequest';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';
import type { Project } from 'types/models/project.type';

type GETResponse = Project[];
type GETParams = {
    include?: string;
};
type GETQueryKey = [string, GETParams];

export const getProjects: QueryFunction<GETResponse, GETQueryKey> = async ({ queryKey }) => {
    const [, args] = queryKey;
    const response = await axiosRequest<GETResponse>({
        method: 'GET',
        url: `/projects${serializeToQueryUrl(args)}`,
    });
    if (response.success) {
        return response.data;
    }
    return [];
};

export const useProjects = (params: GETParams = {}) => {
    const { data, isLoading } = useQuery(['projects', params], getProjects, {
        refetchOnWindowFocus: 'always',
    });
    return {
        projects: data || [],
        isLoading,
    };
};
