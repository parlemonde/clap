import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { GetPDFParams } from './projects.pdf';
import type { HttpRequestError } from 'src/utils/http-request';
import { httpRequest } from 'src/utils/http-request';

type ProjectVideo = {
    progress: number;
    url: string;
};
type POSTParams = { projectId: number; data: GetPDFParams };
type POSTResponse = ProjectVideo;

export const createProjectVideo = async ({ projectId, data }: POSTParams): Promise<POSTResponse> => {
    const response = await httpRequest<POSTResponse>({
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
    mutationOpts: Omit<UseMutationOptions<POSTResponse, HttpRequestError, POSTParams>, 'mutationFn'> = {},
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
