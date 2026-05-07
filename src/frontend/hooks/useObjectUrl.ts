'use client';

import * as React from 'react';

export function useObjectUrl(blob: Blob | null | undefined): string | null {
    const objectUrl = React.useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);

    React.useEffect(() => {
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [objectUrl]);

    return objectUrl;
}
