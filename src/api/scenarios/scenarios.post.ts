import React from 'react';
import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import { userContext } from 'src/contexts/userContext';
import type { AxiosRequestError } from 'src/utils/axiosRequest';
import { axiosRequest } from 'src/utils/axiosRequest';
import { getFromLocalStorage, setToLocalStorage } from 'src/utils/local-storage';
import type { Scenario } from 'types/models/scenario.type';

type POSTResponse = Scenario;
type POSTParams = {
    themeId: number | string;
    names: Record<string, string>;
    descriptions?: Record<string, string>;
    isDefault?: boolean;
};

export const createScenario = async (isLoggedIn: boolean, data: POSTParams): Promise<POSTResponse> => {
    if (isLoggedIn) {
        const response = await axiosRequest<POSTResponse>({
            method: 'POST',
            url: `/scenarios`,
            data,
        });
        if (response.success) {
            return response.data;
        } else {
            throw response;
        }
    } else {
        const localScenarios = getFromLocalStorage('scenarios', []);
        const newScenario: Scenario = {
            id: `local_${localScenarios.length + 1}`,
            names: data.names,
            descriptions: data.descriptions || {},
            isDefault: false,
            themeId: data.themeId,
            userId: null,
        };
        setToLocalStorage('scenarios', [...localScenarios, newScenario]);
        return newScenario;
    }
};

export const useCreateScenarioMutation = (mutationOpts: Omit<UseMutationOptions<POSTResponse, AxiosRequestError, POSTParams>, 'mutationFn'> = {}) => {
    const queryClient = useQueryClient();
    const { user } = React.useContext(userContext);
    const isLoggedIn = user !== null;

    return useMutation(
        React.useCallback((data: POSTParams) => createScenario(isLoggedIn, data), [isLoggedIn]),
        {
            ...mutationOpts,
            onSuccess: (data, variables, context) => {
                queryClient.invalidateQueries('scenarios');
                queryClient.invalidateQueries('scenario');
                if (mutationOpts.onSuccess !== undefined) {
                    mutationOpts.onSuccess(data, variables, context);
                }
            },
        },
    );
};
