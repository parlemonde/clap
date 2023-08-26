import React from 'react';
import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import { userContext } from 'src/contexts/userContext';
import type { HttpRequestError } from 'src/utils/http-request';
import { httpRequest } from 'src/utils/http-request';
import { getFromLocalStorage, setToLocalStorage } from 'src/utils/local-storage';
import type { Theme } from 'types/models/theme.type';

type POSTResponse = Theme;
type POSTParams = {
    names: Record<string, string>;
    isDefault?: boolean;
    order?: number;
    imageUrl?: string;
};

export const createTheme = async (isLoggedIn: boolean, data: POSTParams): Promise<POSTResponse> => {
    if (isLoggedIn) {
        const response = await httpRequest<Theme>({
            method: 'POST',
            url: `/themes`,
            data,
        });
        if (response.success) {
            return response.data;
        } else {
            throw response;
        }
    } else {
        const localThemes = getFromLocalStorage('themes', []);
        const newTheme: Theme = {
            id: `local_${localThemes.length + 1}`,
            order: 0,
            isDefault: false,
            names: data.names,
            userId: null,
            imageUrl: data.imageUrl || null,
        };
        setToLocalStorage('themes', [...localThemes, newTheme]);
        return newTheme;
    }
};

export const useCreateThemeMutation = (mutationOpts: Omit<UseMutationOptions<Theme, HttpRequestError, POSTParams>, 'mutationFn'> = {}) => {
    const queryClient = useQueryClient();
    const { user } = React.useContext(userContext);
    const isLoggedIn = user !== null;

    return useMutation(
        React.useCallback((data: POSTParams) => createTheme(isLoggedIn, data), [isLoggedIn]),
        {
            ...mutationOpts,
            onSuccess: (data, variables, context) => {
                queryClient.invalidateQueries('themes');
                queryClient.invalidateQueries('theme');
                if (mutationOpts.onSuccess !== undefined) {
                    mutationOpts.onSuccess(data, variables, context);
                }
            },
        },
    );
};
