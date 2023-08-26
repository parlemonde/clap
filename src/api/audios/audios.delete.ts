import type { UseMutationOptions } from 'react-query';
import { useMutation } from 'react-query';

import type { HttpRequestError } from 'src/utils/http-request';
import { httpRequest } from 'src/utils/http-request';

type DELETEParams = {
    soundUrl: string;
};

export const deleteSound = async ({ soundUrl }: DELETEParams): Promise<void> => {
    const response = await httpRequest<void>({
        method: 'DELETE',
        url: soundUrl,
        baseUrl: '',
    });
    if (response.success) {
        return;
    } else {
        throw response;
    }
};

export const useDeleteSoundMutation = (mutationOpts: Omit<UseMutationOptions<void, HttpRequestError, DELETEParams>, 'mutationFn'> = {}) => {
    return useMutation(deleteSound, {
        ...mutationOpts,
        onSuccess: (data, variables, context) => {
            if (mutationOpts.onSuccess !== undefined) {
                mutationOpts.onSuccess(data, variables, context);
            }
        },
    });
};
