import { axiosRequest } from 'src/utils/axiosRequest';
import type { Question } from 'types/models/question.type';

export type GetPDFParams = {
    projectId: number;
    projectTitle: string;
    themeId: string | number;
    themeName: string;
    scenarioId: string | number;
    scenarioName: string;
    scenarioDescription: string;
    questions: Question[];
    languageCode: string;
    soundUrl: string | null;
    soundVolume: number | null;
    musicBeginTime?: number;
};

export const getProjectPdf = async (data: GetPDFParams) => {
    const response = await axiosRequest<{ url: string }>({
        method: 'POST',
        url: `/projects/pdf`,
        data,
    });
    if (response.success) {
        return response.data.url;
    } else {
        return null;
    }
};
