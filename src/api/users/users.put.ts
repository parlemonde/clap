import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { AxiosRequestError } from 'src/utils/axiosRequest';
import { axiosRequest } from 'src/utils/axiosRequest';
import type { User } from 'types/models/user.type';

type PUTResponse = { user: User };
export type PUTParams = {
    userId: number;
    oldPassword?: string;
    password?: string;
    email?: string;
    pseudo?: string;
    languageCode?: string;
    type?: number;
};

export const updateUser = async ({ userId, ...data }: PUTParams): Promise<PUTResponse> => {
    const response = await axiosRequest<PUTResponse>({
        method: 'PUT',
        url: `/users/${userId}`,
        data,
    });
    if (response.success) {
        return response.data;
    } else {
        throw response;
    }
};

export const useUpdateUserMutation = (mutationOpts: Omit<UseMutationOptions<PUTResponse, AxiosRequestError, PUTParams>, 'mutationFn'> = {}) => {
    const queryClient = useQueryClient();

    return useMutation(updateUser, {
        ...mutationOpts,
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries('users');
            queryClient.invalidateQueries('user');
            if (mutationOpts.onSuccess !== undefined) {
                mutationOpts.onSuccess(data, variables, context);
            }
        },
    });
};
