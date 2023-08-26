import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { HttpRequestError } from 'src/utils/http-request';
import { httpRequest } from 'src/utils/http-request';

type DELETEParams = {
    planId: number;
};

export const deletePlan = async ({ planId }: DELETEParams): Promise<void> => {
    const response = await httpRequest<void>({
        method: 'DELETE',
        url: `/plans/${planId}`,
    });
    if (response.success) {
        return;
    } else {
        throw response;
    }
};

export const useDeletePlanMutation = (mutationOpts: Omit<UseMutationOptions<void, HttpRequestError, DELETEParams>, 'mutationFn'> = {}) => {
    const queryClient = useQueryClient();

    return useMutation(deletePlan, {
        ...mutationOpts,
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries('plans');
            queryClient.invalidateQueries('plan');
            if (mutationOpts.onSuccess !== undefined) {
                mutationOpts.onSuccess(data, variables, context);
            }
        },
    });
};
