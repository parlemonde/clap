import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { AxiosRequestError } from 'src/utils/axiosRequest';
import { axiosRequest } from 'src/utils/axiosRequest';
import type { Project } from 'types/models/project.type';

type PUTResponse = Project;
type PUTParams = {
    projectId: number;
    title?: string;
    soundUrl?: string | null;
    soundVolume?: number | null;
    musicBeginTime?: number;
};

export const updateProject = async ({ projectId, ...data }: PUTParams): Promise<PUTResponse> => {
    const response = await axiosRequest<PUTResponse>({
        method: 'PUT',
        url: `/projects/${projectId}`,
        data,
    });
    if (response.success) {
        return response.data;
    } else {
        throw response;
    }
};

export const useUpdateProjectMutation = (mutationOpts: Omit<UseMutationOptions<PUTResponse, AxiosRequestError, PUTParams>, 'mutationFn'> = {}) => {
    const queryClient = useQueryClient();

    return useMutation(updateProject, {
        ...mutationOpts,
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries('projects');
            queryClient.invalidateQueries('project');
            if (mutationOpts.onSuccess !== undefined) {
                mutationOpts.onSuccess(data, variables, context);
            }
        },
    });
};
