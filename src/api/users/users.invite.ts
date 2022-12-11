import { axiosRequest } from 'src/utils/axiosRequest';

type GETResponse = { inviteCode: string | null };

export const getUsersInvite = async (): Promise<GETResponse> => {
    const response = await axiosRequest<GETResponse>({
        method: 'GET',
        url: `/users/invite`,
    });
    if (response.success) {
        return response.data;
    }
    return {
        inviteCode: null,
    };
};
