'use client';

import * as React from 'react';

import { KeepRatio } from '@frontend/components/layout/KeepRatio';
import { Placeholder } from '@frontend/components/layout/Placeholder';
import { Text } from '@frontend/components/layout/Typography';

export const ThemeCardPlaceholder = () => {
    return (
        <div style={{ textAlign: 'center' }}>
            <KeepRatio ratio={0.7}>
                <Placeholder width="100%" height="100%" />
            </KeepRatio>
            <Text variant="p" marginTop="xs">
                <Placeholder variant="text" width="80%" />
            </Text>
        </div>
    );
};
