import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { AxiosRequestError } from 'src/utils/axiosRequest';
import { axiosRequest } from 'src/utils/axiosRequest';

type DELETEParams = {
    themeId: number;
};

export const deleteTheme = async ({ themeId }: DELETEParams): Promise<void> => {
    const response = await axiosRequest<void>({
        method: 'DELETE',
        url: `/themes/${themeId}`,
    });
    if (response.success) {
        return;
    } else {
        throw response;
    }
};

export const useDeleteThemeMutation = (mutationOpts: Omit<UseMutationOptions<void, AxiosRequestError, DELETEParams>, 'mutationFn'> = {}) => {
    const queryClient = useQueryClient();

    return useMutation(deleteTheme, {
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
