import React from 'react';
import type { QueryFunction } from 'react-query';
import { useQuery } from 'react-query';

import { userContext } from 'src/contexts/userContext';
import { httpRequest } from 'src/utils/http-request';
import { getFromLocalStorage } from 'src/utils/local-storage';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';
import type { Scenario } from 'types/models/scenario.type';

type GETResponse = Scenario[];
type GETParams = {
    isDefault?: boolean;
    self?: boolean;
    themeId?: string | number;
};
type GETQueryKey = [string, boolean, GETParams | undefined];

export const getScenarios: QueryFunction<GETResponse, GETQueryKey> = async ({ queryKey }) => {
    const [, isLoggedIn, args = {}] = queryKey;
    const localScenarios = isLoggedIn ? [] : getFromLocalStorage('scenarios', []).filter((s) => s.themeId === args.themeId);
    if (typeof args.themeId === 'string') {
        return localScenarios;
    } else {
        const response = await httpRequest<Scenario[]>({
            method: 'GET',
            url: `/scenarios${serializeToQueryUrl(args || {})}`,
        });
        if (response.success) {
            return [...response.data, ...localScenarios];
        } else {
            return localScenarios;
        }
    }
};

export const useScenarios = (args?: GETParams) => {
    const { user } = React.useContext(userContext);
    const isLoggedIn = user !== null;

    const { data, isLoading } = useQuery(['scenarios', isLoggedIn, args], getScenarios, {
        refetchOnWindowFocus: 'always',
    });
    return {
        scenarios: data || [],
        isLoading,
    };
};
