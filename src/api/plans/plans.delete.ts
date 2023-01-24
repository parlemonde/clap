import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { AxiosRequestError } from 'src/utils/axiosRequest';
import { axiosRequest } from 'src/utils/axiosRequest';

type DELETEParams = {
    planId: number;
};

export const deletePlan = async ({ planId }: DELETEParams): Promise<void> => {
    const response = await axiosRequest<void>({
        method: 'DELETE',
        url: `/plans/${planId}`,
    });
    if (response.success) {
        return;
    } else {
        throw response;
    }
};

export const useDeletePlanMutation = (mutationOpts: Omit<UseMutationOptions<void, AxiosRequestError, DELETEParams>, 'mutationFn'> = {}) => {
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
