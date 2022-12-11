import type { QueryFunction, UseQueryOptions } from 'react-query';
import { useQuery } from 'react-query';

import { axiosRequest } from 'src/utils/axiosRequest';
import { getFromLocalStorage } from 'src/utils/local-storage';
import type { Scenario } from 'types/models/scenario.type';

type GETResponse = Scenario | undefined;
type GETParams = string | number | undefined;
type GETError = never;
type GETQueryKey = [string, GETParams];

export const getScenario: QueryFunction<GETResponse, GETQueryKey> = async ({ queryKey }) => {
    const [, scenarioId] = queryKey;
    if (!scenarioId) {
        return undefined;
    } else if (typeof scenarioId === 'string') {
        return getFromLocalStorage('scenarios', []).find((s) => s.id === scenarioId) || undefined;
    } else {
        const response = await axiosRequest<Scenario>({
            method: 'GET',
            url: `/scenarios/${scenarioId}`,
        });
        if (response.success) {
            return response.data;
        }
        return undefined;
    }
};

export const useScenario = (scenarioId: string | number | undefined, options?: UseQueryOptions<GETResponse, GETError, GETResponse, GETQueryKey>) => {
    const { data, isLoading } = useQuery(['scenario', scenarioId], getScenario, options);
    return {
        scenario: data,
        isLoading,
    };
};
