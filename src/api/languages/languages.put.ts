import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { HttpRequestError } from 'src/utils/http-request';
import { httpRequest } from 'src/utils/http-request';

type PUTResponse = {
    url: string;
};
type PUTParams = {
    languageId: string;
    file: Blob;
};

export const updateLanguage = async ({ languageId, file }: PUTParams): Promise<PUTResponse> => {
    const bodyFormData = new FormData();
    bodyFormData.append('file', file);

    const response = await httpRequest<PUTResponse>({
        method: 'POST',
        url: `/locales/${languageId}`,
        data: bodyFormData,
    });
    if (response.success) {
        return response.data;
    } else {
        throw response;
    }
};

export const useUpdateLanguageMutation = (mutationOpts: Omit<UseMutationOptions<PUTResponse, HttpRequestError, PUTParams>, 'mutationFn'> = {}) => {
    const queryClient = useQueryClient();

    return useMutation(updateLanguage, {
        ...mutationOpts,
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries('questions-templates');
            queryClient.invalidateQueries('questions-template');
            if (mutationOpts.onSuccess !== undefined) {
                mutationOpts.onSuccess(data, variables, context);
            }
        },
    });
};
