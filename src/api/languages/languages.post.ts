import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { AxiosRequestError } from 'src/utils/axiosRequest';
import { axiosRequest } from 'src/utils/axiosRequest';
import type { Language } from 'types/models/language.type';

type POSTResponse = Language;
type POSTParams = Language;

export const createLanguage = async (data: POSTParams): Promise<POSTResponse> => {
    const response = await axiosRequest<POSTResponse>({
        method: 'POST',
        url: `/languages`,
        data,
    });
    if (response.success) {
        return response.data;
    } else {
        throw response;
    }
};

export const useCreateLanguageMutation = (mutationOpts: Omit<UseMutationOptions<POSTResponse, AxiosRequestError, POSTParams>, 'mutationFn'> = {}) => {
    const queryClient = useQueryClient();

    return useMutation(createLanguage, {
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
