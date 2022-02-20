import React from 'react';
import type { QueryFunction } from 'react-query';
import { useQueryClient, useQuery } from 'react-query';

import { UserServiceContext } from 'src/services/UserService';
import { serializeToQueryUrl } from 'src/util';
import type { Question } from 'types/models/question.type';

export const useQuestions = (
    args: { isDefault?: boolean; scenarioId?: string | number | null; languageCode?: string } = {},
): { questions: Question[]; setQuestions(questions: Question[]): void } => {
    const { axiosLoggedRequest } = React.useContext(UserServiceContext);
    const queryClient = useQueryClient();
    const getQuestions: QueryFunction<Question[]> = React.useCallback(async () => {
        if (!args.scenarioId && args.scenarioId !== 0) {
            return [];
        }
        const response = await axiosLoggedRequest({
            method: 'GET',
            url: `/questions${serializeToQueryUrl(args)}`,
        });
        if (response.error) {
            return [];
        }
        return response.data;
    }, [args, axiosLoggedRequest]);
    const { data, isLoading, error } = useQuery<Question[], unknown>(['questions', args], getQuestions);
    const setQuestions = React.useCallback(
        (q: Question[]) => {
            queryClient.setQueryData(['questions', args], q);
        },
        [args, queryClient],
    );
    return {
        questions: isLoading || error ? [] : data || [],
        setQuestions,
    };
};

export const useQuestionRequests = (): {
    getDefaultQuestions(args: { isDefault?: boolean; scenarioId: string | number | null; languageCode?: string }): Promise<Question[]>;
    addQuestion(question: Question & { projectId: number }): Promise<Question | null>;
    editQuestion(question: Question): Promise<void>;
    updateOrder(questions: Question[]): Promise<void>;
    deleteQuestion: (question: Question) => Promise<void>;
} => {
    const queryClient = useQueryClient();
    const { axiosLoggedRequest } = React.useContext(UserServiceContext);
    const getDefaultQuestions = React.useCallback(
        async (args: { isDefault?: boolean; scenarioId: string | number | null; languageCode?: string }): Promise<Question[]> => {
            if (args.scenarioId === null || typeof args.scenarioId === 'string') {
                return [];
            }
            const url: string = `/questions${serializeToQueryUrl(args)}`;
            const response =
                (queryClient.getQueryData(['questions', 'user-default', args]) as { error?: unknown; data: Question[] }) ||
                (await queryClient.fetchQuery(['questions', 'user-default', args], async () =>
                    axiosLoggedRequest({
                        method: 'GET',
                        url,
                    }),
                ));
            if (!response.error) {
                return response.data.map((q: Question) => ({ ...q, isDefault: false }));
            }
            return [];
        },
        [queryClient, axiosLoggedRequest],
    );

    const addQuestion = React.useCallback(
        async (question: Question & { projectId: number }) => {
            const response = await axiosLoggedRequest({
                url: `/questions`,
                method: 'POST',
                data: question,
            });
            if (response.error) {
                return null;
            }
            return response.data;
        },
        [axiosLoggedRequest],
    );

    const editQuestion = React.useCallback(
        async (question: Question) => {
            if (!question.id) {
                return;
            }
            await axiosLoggedRequest({
                url: `/questions/${question.id}`,
                method: 'PUT',
                data: question,
            });
        },
        [axiosLoggedRequest],
    );

    const updateOrder = React.useCallback(
        async (questions: Question[]) => {
            await axiosLoggedRequest({
                method: 'PUT',
                url: '/questions/update-order',
                data: {
                    order: questions.filter((q) => q.id).map((q) => q.id),
                },
            });
        },
        [axiosLoggedRequest],
    );

    const deleteQuestion = React.useCallback(
        async (question: Question) => {
            if (!question.id) {
                return;
            }
            await axiosLoggedRequest({
                method: 'DELETE',
                url: `/questions/${question.id}`,
            });
        },
        [axiosLoggedRequest],
    );

    return { getDefaultQuestions, addQuestion, editQuestion, updateOrder, deleteQuestion };
};
