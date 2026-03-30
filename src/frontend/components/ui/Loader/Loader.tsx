import * as React from 'react';

import { BackDrop } from '@frontend/components/layout/BackDrop';
import { CircularProgress } from '@frontend/components/layout/CircularProgress';
import { Flex } from '@frontend/components/layout/Flex';

type LoaderProps = {
    isLoading?: boolean;
};
export const Loader = ({ isLoading = false }: LoaderProps) => {
    if (!isLoading) {
        return null;
    }
    return (
        <BackDrop>
            <Flex isFullWidth isFullHeight alignItems="center" justifyContent="center">
                <CircularProgress />
            </Flex>
        </BackDrop>
    );
};
