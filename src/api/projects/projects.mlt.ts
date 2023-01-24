import type { GetPDFParams } from './projects.pdf';
import { axiosRequest } from 'src/utils/axiosRequest';

export const getProjectMlt = async (data: GetPDFParams) => {
    const response = await axiosRequest<{ url: string }>({
        method: 'POST',
        url: `/projects/mlt`,
        data,
    });
    if (response.success) {
        return response.data.url;
    } else {
        return null;
    }
};
