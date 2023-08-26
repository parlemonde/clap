import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { HttpRequestError } from 'src/utils/http-request';
import { httpRequest } from 'src/utils/http-request';
import type { Theme } from 'types/models/theme.type';

type PUTResponse = Theme;
type PUTParams = {
    themeId: number;
    order?: number;
    names?: Record<string, string>;
    isDefault?: boolean;
    imageUrl?: string;
};

export const updateTheme = async ({ themeId, ...data }: PUTParams): Promise<PUTResponse> => {
    const response = await httpRequest<PUTResponse>({
        method: 'PUT',
        url: `/themes/${themeId}`,
        data,
    });
    if (response.success) {
        return response.data;
    } else {
        throw response;
    }
};

export const useUpdateThemeMutation = (mutationOpts: Omit<UseMutationOptions<PUTResponse, HttpRequestError, PUTParams>, 'mutationFn'> = {}) => {
    const queryClient = useQueryClient();

    return useMutation(updateTheme, {
        ...mutationOpts,
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries('themes');
            queryClient.invalidateQueries('theme');
            if (mutationOpts.onSuccess !== undefined) {
                mutationOpts.onSuccess(data, variables, context);
            }
        },
    });
};
