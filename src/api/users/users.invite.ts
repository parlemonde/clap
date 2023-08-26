import { httpRequest } from 'src/utils/http-request';

type GETResponse = { inviteCode: string | null };

export const getUsersInvite = async (): Promise<GETResponse> => {
    const response = await httpRequest<GETResponse>({
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
