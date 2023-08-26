import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { HttpRequestError } from 'src/utils/http-request';
import { httpRequest } from 'src/utils/http-request';

type DELETEParams = {
    projectId: number;
};

export const deleteProject = async ({ projectId }: DELETEParams): Promise<void> => {
    const response = await httpRequest<void>({
        method: 'DELETE',
        url: `/projects/${projectId}`,
    });
    if (response.success) {
        return;
    } else {
        throw response;
    }
};

export const useDeleteProjectMutation = (mutationOpts: Omit<UseMutationOptions<void, HttpRequestError, DELETEParams>, 'mutationFn'> = {}) => {
    const queryClient = useQueryClient();

    return useMutation(deleteProject, {
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
