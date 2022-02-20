import type { NextPageContext } from 'next';

import type { User } from 'types/models/user.type';

interface initialData {
    currentLocale: string;
    locales: { [key: string]: string };
    csrfToken: string | null;
    user: User | null;
}

export const getInitialData = (ctx: NextPageContext): initialData => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctxRequest: any = ctx.req || null;

    if (ctxRequest === null) {
        // client code
        const initialData = JSON.parse(window.document.getElementById('__NEXT_DATA__')?.innerText || 'null');
        return {
            currentLocale: initialData?.props?.currentLocale || 'fr',
            locales: initialData?.props?.locales || {},
            csrfToken: initialData?.props?.csrfToken || null,
            user: initialData?.props?.user || null,
        };
    } else {
        // server code
        return {
            currentLocale: ctxRequest?.currentLocale || 'fr',
            locales: ctxRequest?.locales || {},
            csrfToken: ctxRequest?.csrfToken || null,
            user: ctxRequest?.user || null,
        };
    }
};
