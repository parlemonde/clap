import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { HttpRequestError } from 'src/utils/http-request';
import { httpRequest } from 'src/utils/http-request';

type PUTParams = {
    order: number[];
};

export const reorderQuestions = async (data: PUTParams): Promise<void> => {
    const response = await httpRequest<void>({
        method: 'PUT',
        url: `/questions/order`,
        data,
    });
    if (response.success) {
        return;
    } else {
        throw response;
    }
};

export const useReorderQuestionsMutation = (mutationOpts: Omit<UseMutationOptions<void, HttpRequestError, PUTParams>, 'mutationFn'> = {}) => {
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
