import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { AxiosRequestError } from 'src/utils/axiosRequest';
import { axiosRequest } from 'src/utils/axiosRequest';

type POSTParams = {
    order: number[];
};

export const reorderThemes = async (data: POSTParams): Promise<void> => {
    const response = await axiosRequest<void>({
        method: 'PUT',
        url: `/themes/order`,
        data,
    });
    if (response.success) {
        return;
    } else {
        throw response;
    }
};

export const useReorderThemesMutation = (mutationOpts: Omit<UseMutationOptions<void, AxiosRequestError, POSTParams>, 'mutationFn'> = {}) => {
    const queryClient = useQueryClient();

    return useMutation(reorderThemes, {
        ...mutationOpts,
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries('themes');
            queryClient.invalidateQueries('theme');
            if (mutationOpts.onSuccess !== undefined) {
                mutationOpts.onSuccess(data, variables, context);
            }
        },
    });
};
