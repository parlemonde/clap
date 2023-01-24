import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { AxiosRequestError } from 'src/utils/axiosRequest';
import { axiosRequest } from 'src/utils/axiosRequest';
import type { Theme } from 'types/models/theme.type';

type PUTResponse = Theme;
type PUTParams = {
    scenarioId: number;
    names?: Record<string, string>;
    descriptions?: Record<string, string>;
    isDefault?: boolean;
};

export const updateScenario = async ({ scenarioId, ...data }: PUTParams): Promise<PUTResponse> => {
    const response = await axiosRequest<PUTResponse>({
        method: 'PUT',
        url: `/scenarios/${scenarioId}`,
        data,
    });
    if (response.success) {
        return response.data;
    } else {
        throw response;
    }
};

export const useUpdateScenarioMutation = (mutationOpts: Omit<UseMutationOptions<PUTResponse, AxiosRequestError, PUTParams>, 'mutationFn'> = {}) => {
    const queryClient = useQueryClient();

    return useMutation(updateScenario, {
        ...mutationOpts,
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries('scenarios');
            queryClient.invalidateQueries('scenario');
            if (mutationOpts.onSuccess !== undefined) {
                mutationOpts.onSuccess(data, variables, context);
            }
        },
    });
};
