import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { AxiosRequestError } from 'src/utils/axiosRequest';
import { axiosRequest } from 'src/utils/axiosRequest';
import type { QuestionTemplate } from 'types/models/question.type';

type PUTResponse = QuestionTemplate;
type PUTParams = {
    order: number[];
};

export const updateQuestionTemplateOrder = async (data: PUTParams): Promise<PUTResponse> => {
    const response = await axiosRequest<PUTResponse>({
        method: 'PUT',
        url: `/questions-templates/order`,
        data,
    });
    if (response.success) {
        return response.data;
    } else {
        throw response;
    }
};

export const useUpdateQuestionTemplateOrderMutation = (
    mutationOpts: Omit<UseMutationOptions<PUTResponse, AxiosRequestError, PUTParams>, 'mutationFn'> = {},
) => {
    const queryClient = useQueryClient();

    return useMutation(updateQuestionTemplateOrder, {
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
