import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { HttpRequestError } from 'src/utils/http-request';
import { httpRequest } from 'src/utils/http-request';
import type { Question } from 'types/models/question.type';
import type { Title } from 'types/models/title.type';

type PUTResponse = Question;
type PUTParams = {
    questionId: number;
    question?: string;
    title?: Title | null;
    voiceOff?: string | null;
    voiceOffBeginTime?: number;
    soundUrl?: string | null;
    soundVolume?: number | null;
};

export const updateQuestion = async ({ questionId, ...data }: PUTParams): Promise<PUTResponse> => {
    const response = await httpRequest<PUTResponse>({
        method: 'PUT',
        url: `/questions/${questionId}`,
        data,
    });
    if (response.success) {
        return response.data;
    } else {
        throw response;
    }
};

export const useUpdateQuestionMutation = (mutationOpts: Omit<UseMutationOptions<PUTResponse, HttpRequestError, PUTParams>, 'mutationFn'> = {}) => {
    const queryClient = useQueryClient();

    return useMutation(updateQuestion, {
        ...mutationOpts,
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries('questions');
            queryClient.invalidateQueries('question');
            if (mutationOpts.onSuccess !== undefined) {
                mutationOpts.onSuccess(data, variables, context);
            }
        },
    });
};
