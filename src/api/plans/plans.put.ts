import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { HttpRequestError } from 'src/utils/http-request';
import { httpRequest } from 'src/utils/http-request';
import type { Plan } from 'types/models/plan.type';

type PUTResponse = Plan;
type PUTParams = {
    planId: number;
    description?: string;
    index?: number;
    imageUrl?: string | null;
    duration?: number;
};

export const updatePlan = async ({ planId, ...data }: PUTParams): Promise<PUTResponse> => {
    const response = await httpRequest<PUTResponse>({
        method: 'PUT',
        url: `/plans/${planId}`,
        data,
    });
    if (response.success) {
        return response.data;
    } else {
        throw response;
    }
};

export const useUpdatePlanMutation = (mutationOpts: Omit<UseMutationOptions<PUTResponse, HttpRequestError, PUTParams>, 'mutationFn'> = {}) => {
    const queryClient = useQueryClient();

    return useMutation(updatePlan, {
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
