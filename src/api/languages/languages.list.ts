import type { QueryFunction } from 'react-query';
import { useQuery } from 'react-query';

import { httpRequest } from 'src/utils/http-request';
import type { Language } from 'types/models/language.type';

type GETResponse = Language[];
type GETQueryKey = [string];

export const getLanguages: QueryFunction<GETResponse, GETQueryKey> = async () => {
    const response = await httpRequest<Language[]>({
        method: 'GET',
        url: `/languages`,
    });
    if (response.success) {
        return response.data;
    }
    return [];
};

export const useLanguages = () => {
    const { data, isLoading } = useQuery(['languages'], getLanguages);
    return {
        languages: data || [],
        isLoading,
    };
};
