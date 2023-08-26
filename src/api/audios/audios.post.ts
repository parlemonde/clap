import type { UseMutationOptions } from 'react-query';
import { useMutation } from 'react-query';

import type { HttpRequestError } from 'src/utils/http-request';
import { httpRequest } from 'src/utils/http-request';

type POSTResponse = {
    url: string;
};
type POSTParams = {
    sound: Blob;
};

export const createSound = async (data: POSTParams): Promise<POSTResponse> => {
    const bodyFormData = new FormData();
    bodyFormData.append('audio', data.sound);

    const response = await httpRequest<POSTResponse>({
        method: 'POST',
        url: `/audios`,
        data: bodyFormData,
    });
    if (response.success) {
        return response.data;
    } else {
        throw response;
    }
};

export const useCreateSoundMutation = (mutationOpts: Omit<UseMutationOptions<POSTResponse, HttpRequestError, POSTParams>, 'mutationFn'> = {}) => {
    return useMutation(createSound, {
        ...mutationOpts,
        onSuccess: (data, variables, context) => {
            if (mutationOpts.onSuccess !== undefined) {
                mutationOpts.onSuccess(data, variables, context);
            }
        },
    });
};
