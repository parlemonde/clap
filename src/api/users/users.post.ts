import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { AxiosRequestError } from 'src/utils/axiosRequest';
import { axiosRequest } from 'src/utils/axiosRequest';
import type { User } from 'types/models/user.type';

type POSTResponse = { user: User };
export type POSTParams = {
    password?: string;
    inviteCode: string;
    email: string;
    pseudo: string;
    languageCode?: string;
};

export const createUser = async (data: POSTParams): Promise<POSTResponse> => {
    const response = await axiosRequest<POSTResponse>({
        method: 'POST',
        url: `/users`,
        data,
    });
    if (response.success) {
        return response.data;
    } else {
        throw response;
    }
};

export const useCreateUserMutation = (mutationOpts: Omit<UseMutationOptions<POSTResponse, AxiosRequestError, POSTParams>, 'mutationFn'> = {}) => {
    const queryClient = useQueryClient();

    return useMutation(createUser, {
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
