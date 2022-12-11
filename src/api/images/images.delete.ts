import type { UseMutationOptions } from 'react-query';
import { useMutation } from 'react-query';

import type { AxiosRequestError } from 'src/utils/axiosRequest';
import { axiosRequest } from 'src/utils/axiosRequest';

type DELETEParams = {
    imageUrl: string;
};

export const deleteImage = async ({ imageUrl }: DELETEParams): Promise<void> => {
    const response = await axiosRequest<void>({
        method: 'DELETE',
        url: imageUrl,
        baseURL: '',
    });
    if (response.success) {
        return;
    } else {
        throw response;
    }
};

export const useDeleteImageMutation = (mutationOpts: Omit<UseMutationOptions<void, AxiosRequestError, DELETEParams>, 'mutationFn'> = {}) => {
    return useMutation(deleteImage, {
        ...mutationOpts,
        onSuccess: (data, variables, context) => {
            if (mutationOpts.onSuccess !== undefined) {
                mutationOpts.onSuccess(data, variables, context);
            }
        },
    });
};
