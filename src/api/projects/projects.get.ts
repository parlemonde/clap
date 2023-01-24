import type { UseQueryOptions } from 'react-query';
import { useQuery } from 'react-query';

import { axiosRequest } from 'src/utils/axiosRequest';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';
import type { Project } from 'types/models/project.type';
import type { Question } from 'types/models/question.type';

type GETResponse = Project | undefined;
type GETParams = number | undefined;
type GETError = never;
type GETQueryKey = [string, GETParams];

export const getProject = async (projectId: GETParams): Promise<GETResponse> => {
    if (!projectId) {
        return undefined;
    }

    const [projectResponse, questionsResponse] = await Promise.all([
        axiosRequest<Project>({
            method: 'GET',
            url: `/projects/${projectId}`,
        }),
        axiosRequest<Question[]>({
            method: 'GET',
            url: `/questions${serializeToQueryUrl({ projectId, include: 'plans' })}`,
        }),
    ]);
    if (projectResponse.success) {
        const project = projectResponse.data;
        if (questionsResponse.success) {
            project.questions = questionsResponse.data;
        } else {
            project.questions = [];
        }
        return project;
    } else {
        return undefined;
    }
};

export const useProject = (projectId: GETParams, options?: UseQueryOptions<GETResponse, GETError, GETResponse, GETQueryKey>) => {
    const { data, isLoading } = useQuery(['project', projectId], ({ queryKey }) => getProject(queryKey[1]), options);
    return {
        project: data,
        isLoading,
    };
};
