import React from 'react';
import type { QueryFunction } from 'react-query';
import { useQuery } from 'react-query';

import { userContext } from 'src/contexts/userContext';
import { axiosRequest } from 'src/utils/axiosRequest';
import { getFromLocalStorage } from 'src/utils/local-storage';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';
import type { Theme } from 'types/models/theme.type';

type GETResponse = Theme[];
type GETParams = {
    isDefault?: boolean;
    self?: boolean;
    include?: string[];
};
type GETQueryKey = [string, boolean, GETParams | undefined];

export const getThemes: QueryFunction<GETResponse, GETQueryKey> = async ({ queryKey }) => {
    const [, isLoggedIn, args = {}] = queryKey;
    const localThemes = isLoggedIn ? [] : getFromLocalStorage('themes', []);
    const response = await axiosRequest<Theme[]>({
        method: 'GET',
        url: `/themes${serializeToQueryUrl(args)}`,
    });
    if (response.success) {
        return [...response.data, ...localThemes];
    }
    return localThemes;
};

type UseThemesProps = {
    isDefault?: boolean;
    self?: boolean;
    include?: string[];
};
export const useThemes = (args?: UseThemesProps) => {
    const { user } = React.useContext(userContext);
    const isLoggedIn = user !== null;

    const { data, isLoading } = useQuery(['themes', isLoggedIn, args], getThemes, {
        refetchOnWindowFocus: 'always',
    });
    return {
        themes: data || [],
        isLoading,
    };
};
