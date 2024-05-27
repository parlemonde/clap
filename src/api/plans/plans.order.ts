import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { HttpRequestError } from 'src/utils/http-request';
import { httpRequest } from 'src/utils/http-request';

type PUTParams = {
    order: number[];
};

export const reorderPlans = async (data: PUTParams): Promise<void> => {
    const response = await httpRequest<void>({
        method: 'PUT',
        url: `/plans/order`,
        data,
    });
    if (response.success) {
        return;
    } else {
        throw response;
    }
};

export const useReorderPlansMutation = (mutationOpts: Omit<UseMutationOptions<void, HttpRequestError, PUTParams>, 'mutationFn'> = {}) => {
    const queryClient = useQueryClient();
    return useMutation(reorderPlans, {
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
