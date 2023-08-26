type HttpRequestConfig = {
    url: string;
    baseUrl?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTION' | 'HEAD';
    headers?: Record<string, string>;
    data?: unknown;
};

export type HttpRequestError = {
    success: false;
    status: number;
    errorMessages: string[];
    errorCode: number;
};

export type HttpReturnType<T> =
    | {
          success: true;
          status: number;
          data: T;
      }
    | HttpRequestError;

// -- DEFAULTS --
type HttpDefaultHeaders = Record<string, string>;
export const HTTP_DEFAULT_HEADERS: HttpDefaultHeaders = {};
const BASE_URL = process.env.NEXT_PUBLIC_BASE_APP;

export const httpRequest = async <T>({
    url,
    baseUrl = BASE_URL,
    method = 'GET',
    headers: additionalHeaders = {},
    data = {},
}: HttpRequestConfig): Promise<HttpReturnType<T>> => {
    try {
        let body: FormData | string | undefined = undefined;
        const headers: Record<string, string> = {
            ...HTTP_DEFAULT_HEADERS,
            ...additionalHeaders,
        };
        if ((method === 'POST' || method === 'PUT') && data !== undefined) {
            if (data instanceof FormData) {
                body = data;
            } else {
                headers['Content-Type'] = 'application/json';
                body = JSON.stringify(data);
            }
        }
        const response = await fetch(`${baseUrl}${url}`, {
            method: method,
            mode: 'same-origin',
            headers,
            redirect: 'follow',
            referrerPolicy: 'same-origin',
            body,
        });
        if (response.status >= 400) {
            const error = await response.json();
            return {
                success: false,
                status: response.status,
                errorCode: error?.errorCode,
                errorMessages: error?.errors,
            };
        }
        return {
            success: true,
            status: response.status,
            data: response.status !== 204 ? await response.json() : {},
        };
    } catch (err) {
        console.error(err);
        return {
            success: false,
            status: 500,
            errorCode: 0,
            errorMessages: ['An unknown error happened.'],
        };
    }
};
