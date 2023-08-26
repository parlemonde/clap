import type { UseMutationOptions } from 'react-query';
import { useMutation } from 'react-query';

import type { HttpRequestError } from 'src/utils/http-request';
import { httpRequest } from 'src/utils/http-request';

type POSTResponse = {
    url: string;
};
type POSTParams = {
    image: Blob;
};

export const createImage = async (data: POSTParams): Promise<POSTResponse> => {
    const bodyFormData = new FormData();
    bodyFormData.append('image', data.image);

    const response = await httpRequest<POSTResponse>({
        method: 'POST',
        url: `/images`,
        data: bodyFormData,
    });
    if (response.success) {
        return response.data;
    } else {
        throw response;
    }
};

export const useCreateImageMutation = (mutationOpts: Omit<UseMutationOptions<POSTResponse, HttpRequestError, POSTParams>, 'mutationFn'> = {}) => {
    return useMutation(createImage, {
        ...mutationOpts,
        onSuccess: (data, variables, context) => {
            if (mutationOpts.onSuccess !== undefined) {
                mutationOpts.onSuccess(data, variables, context);
            }
        },
    });
};
