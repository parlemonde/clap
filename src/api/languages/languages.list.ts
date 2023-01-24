import type { QueryFunction } from 'react-query';
import { useQuery } from 'react-query';

import { axiosRequest } from 'src/utils/axiosRequest';
import type { Language } from 'types/models/language.type';

type GETResponse = Language[];
type GETQueryKey = [string];

export const getLanguages: QueryFunction<GETResponse, GETQueryKey> = async () => {
    const response = await axiosRequest<Language[]>({
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
