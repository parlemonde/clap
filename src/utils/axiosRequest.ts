import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';

export type AxiosRequestError = {
    success: false;
    status: number;
    errorMessages: string[];
    errorCode: number;
};

export type AxiosReturnType<T> =
    | {
          success: true;
          status: number;
          data: T;
      }
    | AxiosRequestError;

const axiosRequest = async <T>(req: AxiosRequestConfig): Promise<AxiosReturnType<T>> => {
    try {
        const axiosOptions = {
            baseURL: process.env.NEXT_PUBLIC_BASE_APP,
            ...req,
        };
        const res = await axios(axiosOptions);
        return {
            success: true,
            status: res.status,
            data: res.data,
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if ((error.response || {}).status === 401 || (error.response || {}).status === 403) {
                window.location.replace('/login');
            }

            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error(error.response.data);
                console.error(error.response.status);
            } else {
                console.error(error);
            }
            const data = error.response ? error.response.data || null : null;
            return {
                success: false,
                status: (error.response || {}).status || 404,
                errorMessages: data !== null ? data.errorMessages || [] : [],
                errorCode: data !== null ? data.errorCode || 0 : 0,
            };
        }
        return {
            success: false,
            status: 500,
            errorCode: 0,
            errorMessages: ['An unknown error happened.'],
        };
    }
};

export { axiosRequest };
