import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { HttpRequestError } from 'src/utils/http-request';
import { httpRequest } from 'src/utils/http-request';

type POSTParams = {
    order: number[];
};

export const reorderThemes = async (data: POSTParams): Promise<void> => {
    const response = await httpRequest<void>({
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

export const useReorderThemesMutation = (mutationOpts: Omit<UseMutationOptions<void, HttpRequestError, POSTParams>, 'mutationFn'> = {}) => {
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
