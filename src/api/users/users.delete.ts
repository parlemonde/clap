import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { HttpRequestError } from 'src/utils/http-request';
import { httpRequest } from 'src/utils/http-request';

type DELETEParams = {
    userId: number;
};

export const deleteUser = async ({ userId }: DELETEParams): Promise<void> => {
    const response = await httpRequest<void>({
        method: 'DELETE',
        url: `/users/${userId}`,
    });
    if (response.success) {
        return;
    } else {
        throw response;
    }
};

export const useDeleteUserMutation = (mutationOpts: Omit<UseMutationOptions<void, HttpRequestError, DELETEParams>, 'mutationFn'> = {}) => {
    const queryClient = useQueryClient();

    return useMutation(deleteUser, {
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
