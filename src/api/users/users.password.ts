import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { AxiosRequestError } from 'src/utils/axiosRequest';
import { axiosRequest } from 'src/utils/axiosRequest';
import type { User } from 'types/models/user.type';

type PUTResponse = { user: User };
export type UpdateUserParams = {
    email: string;
    verifyToken: string;
    password: string;
};

export const updateUserPassword = async (data: UpdateUserParams): Promise<PUTResponse> => {
    const response = await axiosRequest<PUTResponse>({
        method: 'POST',
        url: `/login/update-password`,
        data,
    });
    if (response.success) {
        return response.data;
    } else {
        throw response;
    }
};

export const useUpdateUserPasswordMutation = (
    mutationOpts: Omit<UseMutationOptions<PUTResponse, AxiosRequestError, UpdateUserParams>, 'mutationFn'> = {},
) => {
    const queryClient = useQueryClient();

    return useMutation(updateUserPassword, {
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
