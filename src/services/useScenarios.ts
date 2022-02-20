import React from 'react';
import type { QueryFunction } from 'react-query';
import { useQuery } from 'react-query';

import { UserServiceContext } from 'src/services/UserService';
import { serializeToQueryUrl } from 'src/util';
import type { Scenario } from 'types/models/scenario.type';

export const useScenarios = (
    args: {
        getQuestionsCount?: boolean;
        user?: boolean;
        isDefault?: boolean;
        languageCode?: string;
        themeId?: string | number;
    } = {},
): { scenarios: Scenario[] } => {
    const { axiosLoggedRequest } = React.useContext(UserServiceContext);
    const getScenarios: QueryFunction<Scenario[]> = React.useCallback(async () => {
        let localScenarios: Scenario[];
        if (args.themeId === undefined || args.themeId === null) {
            localScenarios = [];
        } else {
            localScenarios = (JSON.parse(localStorage.getItem('scenarios') || '[]') || []).filter((s: Scenario) => s.themeId === args.themeId);
        }
        // local only
        if (typeof args.themeId === 'string') {
            return localScenarios;
        }
        const response = await axiosLoggedRequest({
            method: 'GET',
            url: `/scenarios${serializeToQueryUrl(args)}`,
        });
        if (response.error) {
            return [];
        }
        return [...response.data, ...localScenarios];
    }, [args, axiosLoggedRequest]);
    const { data, isLoading, error } = useQuery<Scenario[], unknown>(['scenarios', args], getScenarios);
    return {
        scenarios: isLoading || error ? [] : data || [],
    };
};

export const useScenarioRequests = (): {
    createScenario(args: { newScenario: Scenario; isAdmin?: boolean }): Promise<Scenario | null>;
} => {
    const { isLoggedIn, axiosLoggedRequest } = React.useContext(UserServiceContext);
    const createScenario = React.useCallback(
        async (args: { newScenario: Scenario; isAdmin?: boolean }): Promise<Scenario | null> => {
            if (isLoggedIn) {
                const response = await axiosLoggedRequest({
                    url: `/scenarios`,
                    method: 'POST',
                    data: {
                        ...args.newScenario,
                        userId: args.isAdmin ? undefined : true,
                    },
                });
                if (!response.error) {
                    return response.data;
                }
                return null;
            } else {
                const localScenarios = JSON.parse(localStorage.getItem('scenarios') || '[]') || [];
                args.newScenario.id = `local_${localScenarios.length}`;
                localScenarios.push(args.newScenario);
                localStorage.setItem('scenarios', JSON.stringify(localScenarios));
                return args.newScenario;
            }
        },
        [isLoggedIn, axiosLoggedRequest],
    );

    return { createScenario };
};
