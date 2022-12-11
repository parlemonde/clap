import { useRouter } from 'next/router';
import React from 'react';

import { getQueryString } from './get-query-string';

export const useQueryId = (queryId: 'themeId' | 'scenarioId'): string | number | undefined => {
    const themeIdStr = useQueryString(queryId);
    const themeId = React.useMemo(() => {
        if (themeIdStr === undefined) {
            return undefined;
        }
        if (themeIdStr.startsWith('local_')) {
            return themeIdStr;
        }
        try {
            return parseInt(themeIdStr, 10) ?? undefined;
        } catch (e) {
            return undefined;
        }
    }, [themeIdStr]);
    return themeId;
};

export const useQueryNumber = (queryKey: string): number | undefined => {
    const queryNbrStr = useQueryString(queryKey);
    const queryNbr = React.useMemo(() => {
        if (queryNbrStr === undefined) {
            return undefined;
        }
        try {
            return parseInt(queryNbrStr, 10) ?? undefined;
        } catch (e) {
            return undefined;
        }
    }, [queryNbrStr]);
    return queryNbr;
};

export const useQueryString = (queryKey: string): string | undefined => {
    const router = useRouter();
    const queryStr = React.useMemo(() => getQueryString(router.query[queryKey]), [router, queryKey]);
    return queryStr;
};
