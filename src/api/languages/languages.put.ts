import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { AxiosRequestError } from 'src/utils/axiosRequest';
import { axiosRequest } from 'src/utils/axiosRequest';

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

    const response = await axiosRequest<PUTResponse>({
        method: 'POST',
        url: `/locales/${languageId}`,
        headers: { 'Content-Type': 'multipart/form-data' },
        data: bodyFormData,
    });
    if (response.success) {
        return response.data;
    } else {
        throw response;
    }
};

export const useUpdateLanguageMutation = (mutationOpts: Omit<UseMutationOptions<PUTResponse, AxiosRequestError, PUTParams>, 'mutationFn'> = {}) => {
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
