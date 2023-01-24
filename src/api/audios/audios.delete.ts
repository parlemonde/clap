import type { UseMutationOptions } from 'react-query';
import { useMutation } from 'react-query';

import type { AxiosRequestError } from 'src/utils/axiosRequest';
import { axiosRequest } from 'src/utils/axiosRequest';

type DELETEParams = {
    soundUrl: string;
};

export const deleteSound = async ({ soundUrl }: DELETEParams): Promise<void> => {
    const response = await axiosRequest<void>({
        method: 'DELETE',
        url: soundUrl,
        baseURL: '',
    });
    if (response.success) {
        return;
    } else {
        throw response;
    }
};

export const useDeleteSoundMutation = (mutationOpts: Omit<UseMutationOptions<void, AxiosRequestError, DELETEParams>, 'mutationFn'> = {}) => {
    return useMutation(deleteSound, {
        ...mutationOpts,
        onSuccess: (data, variables, context) => {
            if (mutationOpts.onSuccess !== undefined) {
                mutationOpts.onSuccess(data, variables, context);
            }
        },
    });
};
