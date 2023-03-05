import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { GetPDFParams } from './projects.pdf';
import type { AxiosRequestError } from 'src/utils/axiosRequest';
import { axiosRequest } from 'src/utils/axiosRequest';

type ProjectVideo = {
    progress: number;
    url: string;
};
type POSTParams = { projectId: number; data: GetPDFParams };
type POSTResponse = ProjectVideo;

export const createProjectVideo = async ({ projectId, data }: POSTParams): Promise<POSTResponse> => {
    const response = await axiosRequest<POSTResponse>({
        method: 'POST',
        url: `/projects/${projectId}/video`,
        data,
    });
    if (response.success) {
        return response.data;
    } else {
        throw response;
    }
};

export const useCreateProjectVideoMutation = (
    mutationOpts: Omit<UseMutationOptions<POSTResponse, AxiosRequestError, POSTParams>, 'mutationFn'> = {},
) => {
    const queryClient = useQueryClient();

    return useMutation(createProjectVideo, {
        ...mutationOpts,
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries('project-video');
            if (mutationOpts.onSuccess !== undefined) {
                mutationOpts.onSuccess(data, variables, context);
            }
        },
    });
};
