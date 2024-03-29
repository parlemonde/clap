import type { QueryFunction, UseQueryOptions } from 'react-query';
import { useQuery } from 'react-query';

import { httpRequest } from 'src/utils/http-request';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';
import type { QuestionTemplate } from 'types/models/question.type';

type GETParams = {
    scenarioId: number;
    languageCode: string;
};
type GETQueryKey = [string, GETParams];

export const getQuestionTemplates = async ({ scenarioId, languageCode }: GETParams): Promise<QuestionTemplate[]> => {
    const questionsResponse = await httpRequest<QuestionTemplate[]>({
        method: 'GET',
        url: `/questions-templates${serializeToQueryUrl({ scenarioId, languageCode })}`,
    });
    if (questionsResponse.success) {
        return questionsResponse.data;
    } else {
        return [];
    }
};

const getQuestionTemplatesForQuery: QueryFunction<QuestionTemplate[], GETQueryKey> = ({ queryKey }) => {
    const [, params] = queryKey;
    return getQuestionTemplates(params);
};

export const useQuestionTemplates = (args: GETParams, options?: UseQueryOptions<QuestionTemplate[], never, QuestionTemplate[], GETQueryKey>) => {
    const { data, isLoading } = useQuery(['questions-templates', args], getQuestionTemplatesForQuery, options);
    return {
        questionTemplates: data || [],
        isLoading,
    };
};
