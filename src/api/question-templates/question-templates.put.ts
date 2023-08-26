import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { HttpRequestError } from 'src/utils/http-request';
import { httpRequest } from 'src/utils/http-request';
import type { QuestionTemplate } from 'types/models/question.type';

type PUTResponse = QuestionTemplate;
type PUTParams = {
    questionId: number;
    question?: string;
};

export const updateQuestionTemplate = async ({ questionId, ...data }: PUTParams): Promise<PUTResponse> => {
    const response = await httpRequest<PUTResponse>({
        method: 'PUT',
        url: `/questions-templates/${questionId}`,
        data,
    });
    if (response.success) {
        return response.data;
    } else {
        throw response;
    }
};

export const useUpdateQuestionTemplate = (mutationOpts: Omit<UseMutationOptions<PUTResponse, HttpRequestError, PUTParams>, 'mutationFn'> = {}) => {
    const queryClient = useQueryClient();

    return useMutation(updateQuestionTemplate, {
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
