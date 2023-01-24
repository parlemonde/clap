import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { AxiosRequestError } from 'src/utils/axiosRequest';
import { axiosRequest } from 'src/utils/axiosRequest';
import type { QuestionTemplate } from 'types/models/question.type';

type POSTResponse = QuestionTemplate;
type POSTParams = {
    question: string;
    index?: number;
    languageCode?: string;
    scenarioId: number;
};

export const createQuestionTemplate = async (data: POSTParams): Promise<POSTResponse> => {
    const response = await axiosRequest<POSTResponse>({
        method: 'POST',
        url: `/questions-templates`,
        data,
    });
    if (response.success) {
        return response.data;
    } else {
        throw response;
    }
};

export const useCreateQuestionTemplate = (mutationOpts: Omit<UseMutationOptions<POSTResponse, AxiosRequestError, POSTParams>, 'mutationFn'> = {}) => {
    const queryClient = useQueryClient();

    return useMutation(createQuestionTemplate, {
        ...mutationOpts,
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries('questions-templates');
            queryClient.invalidateQueries('questions-template');
            if (mutationOpts.onSuccess !== undefined) {
                mutationOpts.onSuccess(data, variables, context);
            }
        },
    });
};
