import React from 'react';
import { useQuery } from 'react-query';

import { axiosRequest } from 'src/util/axiosRequest';
import type { Language } from 'types/models/language.type';

const defaultLanguages = [{ value: 'fr', label: 'Français' }];

export const useLanguages = (): { languages: Language[]; isLoading: boolean } => {
    const getLanguages: () => Promise<Language[]> = React.useCallback(async () => {
        const response = await axiosRequest({
            method: 'GET',
            url: '/languages',
        });
        if (response.error) {
            return [];
        }
        return response.data;
    }, []);

    const { data, isLoading, error } = useQuery<Language[], unknown>('languages', getLanguages);

    return { languages: isLoading || error ? defaultLanguages : data || [], isLoading };
};
