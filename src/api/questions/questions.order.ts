import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { HttpRequestError } from 'src/utils/http-request';
import { httpRequest } from 'src/utils/http-request';

type POSTParams = {
    order: number[];
};

export const reorderQuestions = async (data: POSTParams): Promise<void> => {
    const response = await httpRequest<void>({
        method: 'POST',
        url: `/questions/order`,
        data,
    });
    if (response.success) {
        return;
    } else {
        throw response;
    }
};

export const useReorderQuestionsMutation = (mutationOpts: Omit<UseMutationOptions<void, HttpRequestError, POSTParams>, 'mutationFn'> = {}) => {
    const queryClient = useQueryClient();

    return useMutation(reorderQuestions, {
        ...mutationOpts,
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries('questions');
            queryClient.invalidateQueries('question');
            if (mutationOpts.onSuccess !== undefined) {
                mutationOpts.onSuccess(data, variables, context);
            }
        },
    });
};
