import { axiosRequest } from 'src/utils/axiosRequest';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';
import type { Project } from 'types/models/project.type';
import type { Question } from 'types/models/question.type';

export const getProject = async (projectId: number | undefined) => {
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
