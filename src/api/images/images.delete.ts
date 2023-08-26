import type { UseMutationOptions } from 'react-query';
import { useMutation } from 'react-query';

import type { HttpRequestError } from 'src/utils/http-request';
import { httpRequest } from 'src/utils/http-request';

type DELETEParams = {
    imageUrl: string;
};

export const deleteImage = async ({ imageUrl }: DELETEParams): Promise<void> => {
    const response = await httpRequest<void>({
        method: 'DELETE',
        url: imageUrl,
        baseUrl: '',
    });
    if (response.success) {
        return;
    } else {
        throw response;
    }
};

export const useDeleteImageMutation = (mutationOpts: Omit<UseMutationOptions<void, HttpRequestError, DELETEParams>, 'mutationFn'> = {}) => {
    return useMutation(deleteImage, {
        ...mutationOpts,
        onSuccess: (data, variables, context) => {
            if (mutationOpts.onSuccess !== undefined) {
                mutationOpts.onSuccess(data, variables, context);
            }
        },
    });
};
