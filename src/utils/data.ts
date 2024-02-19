import type { NextPageContext } from 'next';

import { getFromSessionStorage } from './session-storage';
import type { User } from 'types/models/user.type';

interface initialData {
    currentLocale: string;
    locales: { [key: string]: string };
    csrfToken: string | null;
    user: User | null;
    isCollaborationActive: boolean;
}

export const getInitialData = (ctx: NextPageContext): initialData => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctxRequest: any = ctx.req || null;
    const isCollaborationActive = getFromSessionStorage('isCollaborationActive', false);

    if (ctxRequest === null) {
        // client code
        const initialData = JSON.parse(window.document.getElementById('__NEXT_DATA__')?.innerText || 'null');
        return {
            csrfToken: initialData?.props?.csrfToken || null,
            currentLocale: initialData?.props?.currentLocale || 'fr',
            user: initialData?.props?.user || null,
            locales: initialData?.props?.locales || {},
            isCollaborationActive,
        };
    } else {
        // server code
        return {
            csrfToken: ctxRequest?.csrfToken || null,
            currentLocale: ctxRequest?.currentLocale || 'fr',
            user: ctxRequest?.user || null,
            locales: ctxRequest?.locales || {},
            isCollaborationActive,
        };
    }
};
