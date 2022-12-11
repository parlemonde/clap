import type { UseQueryOptions, QueryFunction } from 'react-query';
import { useQuery } from 'react-query';

import { axiosRequest } from 'src/utils/axiosRequest';
import { getFromLocalStorage } from 'src/utils/local-storage';
import type { Theme } from 'types/models/theme.type';

type GETResponse = Theme | undefined;
type GETParams = string | number | undefined;
type GETError = never;
type GETQueryKey = [string, GETParams];

export const getTheme: QueryFunction<GETResponse, GETQueryKey> = async ({ queryKey }) => {
    const [, themeId] = queryKey;
    if (!themeId) {
        return undefined;
    } else if (typeof themeId === 'string') {
        return getFromLocalStorage('themes', []).find((t) => t.id === themeId) || undefined;
    } else {
        const response = await axiosRequest<Theme>({
            method: 'GET',
            url: `/themes/${themeId}`,
        });
        if (response.success) {
            return response.data;
        }
        return undefined;
    }
};

export const useTheme = (themeId: string | number | undefined, options?: UseQueryOptions<GETResponse, GETError, GETResponse, GETQueryKey>) => {
    const { data, isLoading } = useQuery(['theme', themeId], getTheme, options);
    return {
        theme: data,
        isLoading,
    };
};
