import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { HttpRequestError } from 'src/utils/http-request';
import { httpRequest } from 'src/utils/http-request';
import type { Plan } from 'types/models/plan.type';

type POSTResponse = Plan;
type POSTParams = {
    questionId: number;
    description: string;
    index?: number;
    imageUrl?: string | null;
    duration?: number;
};

export const createPlan = async (data: POSTParams): Promise<POSTResponse> => {
    const response = await httpRequest<POSTResponse>({
        method: 'POST',
        url: `/plans`,
        data,
    });
    if (response.success) {
        return response.data;
    } else {
        throw response;
    }
};

export const useCreatePlanMutation = (mutationOpts: Omit<UseMutationOptions<POSTResponse, HttpRequestError, POSTParams>, 'mutationFn'> = {}) => {
    const queryClient = useQueryClient();

    return useMutation(createPlan, {
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
