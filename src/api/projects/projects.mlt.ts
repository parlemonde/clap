import type { GetPDFParams } from './projects.pdf';
import { httpRequest } from 'src/utils/http-request';

export const getProjectMlt = async (data: GetPDFParams) => {
    const response = await httpRequest<{ url: string }>({
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
