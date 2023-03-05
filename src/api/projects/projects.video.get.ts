import type { UseQueryOptions } from 'react-query';
import { useQuery } from 'react-query';

import { axiosRequest } from 'src/utils/axiosRequest';

type ProjectVideo = {
    progress: number;
    url: string;
};
type GETResponse = ProjectVideo | undefined;
type GETParams = number | undefined;
type GETError = never;
type GETQueryKey = [string, GETParams];

export const getProjectVideo = async (projectId: GETParams): Promise<GETResponse> => {
    if (!projectId) {
        return undefined;
    }

    const projectVideoResponse = await axiosRequest<ProjectVideo>({
        method: 'GET',
        url: `/projects/${projectId}/video`,
    });
    if (projectVideoResponse.success) {
        return projectVideoResponse.data;
    } else {
        return undefined;
    }
};

export const useProjectVideo = (projectId: GETParams, options?: UseQueryOptions<GETResponse, GETError, GETResponse, GETQueryKey>) => {
    const { data, isLoading, refetch } = useQuery(['project-video', projectId], ({ queryKey }) => getProjectVideo(queryKey[1]), options);
    return {
        projectVideo: data,
        isLoading,
        refetch,
    };
};
