import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { AxiosRequestError } from 'src/utils/axiosRequest';
import { axiosRequest } from 'src/utils/axiosRequest';

type DELETEParams = {
    questionId: number;
};

export const deleteQuestionTemplate = async ({ questionId }: DELETEParams): Promise<void> => {
    const response = await axiosRequest<void>({
        method: 'DELETE',
        url: `/questions-templates/${questionId}`,
    });
    if (response.success) {
        return;
    } else {
        throw response;
    }
};

export const useDeleteQuestionTemplateMutation = (
    mutationOpts: Omit<UseMutationOptions<void, AxiosRequestError, DELETEParams>, 'mutationFn'> = {},
) => {
    const queryClient = useQueryClient();

    return useMutation(deleteQuestionTemplate, {
        ...mutationOpts,
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries('questions-templates');
            queryClient.invalidateQueries('questions-template');
            if (mutationOpts.onSuccess !== undefined) {
                mutationOpts.onSuccess(data, variables, context);
            }
        },
    });
};
