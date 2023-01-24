import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { AxiosRequestError } from 'src/utils/axiosRequest';
import { axiosRequest } from 'src/utils/axiosRequest';

type DELETEParams = {
    scenarioId: number;
};

export const deleteScenario = async ({ scenarioId }: DELETEParams): Promise<void> => {
    const response = await axiosRequest<void>({
        method: 'DELETE',
        url: `/scenarios/${scenarioId}`,
    });
    if (response.success) {
        return;
    } else {
        throw response;
    }
};

export const useDeleteScenarioMutation = (mutationOpts: Omit<UseMutationOptions<void, AxiosRequestError, DELETEParams>, 'mutationFn'> = {}) => {
    const queryClient = useQueryClient();

    return useMutation(deleteScenario, {
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
