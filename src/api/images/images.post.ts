import type { UseMutationOptions } from 'react-query';
import { useMutation } from 'react-query';

import type { AxiosRequestError } from 'src/utils/axiosRequest';
import { axiosRequest } from 'src/utils/axiosRequest';

type POSTResponse = {
    url: string;
};
type POSTParams = {
    image: Blob;
};

export const createImage = async (data: POSTParams): Promise<POSTResponse> => {
    const bodyFormData = new FormData();
    bodyFormData.append('image', data.image);

    const response = await axiosRequest<POSTResponse>({
        method: 'POST',
        url: `/images`,
        headers: { 'Content-Type': 'multipart/form-data' },
        data: bodyFormData,
    });
    if (response.success) {
        return response.data;
    } else {
        throw response;
    }
};

export const useCreateImageMutation = (mutationOpts: Omit<UseMutationOptions<POSTResponse, AxiosRequestError, POSTParams>, 'mutationFn'> = {}) => {
    return useMutation(createImage, {
        ...mutationOpts,
        onSuccess: (data, variables, context) => {
            if (mutationOpts.onSuccess !== undefined) {
                mutationOpts.onSuccess(data, variables, context);
            }
        },
    });
};
