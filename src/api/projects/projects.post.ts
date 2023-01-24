import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';

import type { AxiosRequestError } from 'src/utils/axiosRequest';
import { axiosRequest } from 'src/utils/axiosRequest';
import type { Project } from 'types/models/project.type';
import type { Question } from 'types/models/question.type';

type POSTParams = {
    title: string;
    themeId: number;
    scenarioId: number;
    questions: Question[];
    soundUrl: string | null;
    soundVolume: number | null;
    musicBeginTime?: number;
};
type POSTResponse = Project;

export const createProject = async (data: POSTParams): Promise<POSTResponse> => {
    const response = await axiosRequest<POSTResponse>({
        method: 'POST',
        url: `/projects`,
        data,
    });
    if (response.success) {
        return response.data;
    } else {
        throw response;
    }
};

export const useCreateProjectMutation = (mutationOpts: Omit<UseMutationOptions<POSTResponse, AxiosRequestError, POSTParams>, 'mutationFn'> = {}) => {
    const queryClient = useQueryClient();

    return useMutation(createProject, {
        ...mutationOpts,
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries('projects');
            queryClient.invalidateQueries('project');
            if (mutationOpts.onSuccess !== undefined) {
                mutationOpts.onSuccess(data, variables, context);
            }
        },
    });
};
