import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { HttpRequestError } from 'src/utils/http-request';
import { httpRequest } from 'src/utils/http-request';
import type { Question } from 'types/models/question.type';
import type { Title } from 'types/models/title.type';

type POSTResponse = Question;
type POSTParams = {
    projectId: number;
    question: string;
    index?: number;
    title?: Title | null;
    voiceOff?: string | null;
    voiceOffBeginTime?: number;
    soundUrl?: string | null;
    soundVolume?: number | null;
};

export const createQuestion = async (data: POSTParams): Promise<POSTResponse> => {
    const response = await httpRequest<POSTResponse>({
        method: 'POST',
        url: `/questions`,
        data,
    });
    if (response.success) {
        return response.data;
    } else {
        throw response;
    }
};

export const useCreateQuestionMutation = (mutationOpts: Omit<UseMutationOptions<POSTResponse, HttpRequestError, POSTParams>, 'mutationFn'> = {}) => {
    const queryClient = useQueryClient();

    return useMutation(createQuestion, {
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
