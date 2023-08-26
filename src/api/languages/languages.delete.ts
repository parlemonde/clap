import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { HttpRequestError } from 'src/utils/http-request';
import { httpRequest } from 'src/utils/http-request';

type DELETEParams = {
    languageId: string;
};

export const deleteLanguage = async ({ languageId }: DELETEParams): Promise<void> => {
    const response = await httpRequest<void>({
        method: 'DELETE',
        url: `/languages/${languageId}`,
    });
    if (response.success) {
        return;
    } else {
        throw response;
    }
};

export const useDeleteLanguageMutation = (mutationOpts: Omit<UseMutationOptions<void, HttpRequestError, DELETEParams>, 'mutationFn'> = {}) => {
    const queryClient = useQueryClient();

    return useMutation(deleteLanguage, {
        ...mutationOpts,
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries('languages');
            queryClient.invalidateQueries('language');
            if (mutationOpts.onSuccess !== undefined) {
                mutationOpts.onSuccess(data, variables, context);
            }
        },
    });
};
