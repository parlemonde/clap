'use client';

import * as React from 'react';

import { ensureLocalMediaServiceWorker } from '@frontend/lib/local-media';

export function LocalMediaServiceWorkerRegistration() {
    React.useEffect(() => {
        ensureLocalMediaServiceWorker().catch(() => {
            // Local media upload surfaces report availability errors when users need them.
        });
    }, []);

    return null;
}
