import { getAuth } from '@server/auth/auth';

export const GET = async (request: Request) => {
    return getAuth().handler(request);
};
export const POST = async (request: Request) => {
    return getAuth().handler(request);
};
export const PATCH = async (request: Request) => {
    return getAuth().handler(request);
};
export const PUT = async (request: Request) => {
    return getAuth().handler(request);
};
export const DELETE = async (request: Request) => {
    return getAuth().handler(request);
};
