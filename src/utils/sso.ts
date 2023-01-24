export const clientId = process.env.NEXT_PUBLIC_CLIENT_ID || '';
export const ssoHost = process.env.NEXT_PUBLIC_PLM_HOST || '';
export const ssoHostName = ssoHost.replace(/(^\w+:|^)\/\//, '');
