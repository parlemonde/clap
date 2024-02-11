'use client';

import * as React from 'react';
import { useFormStatus } from 'react-dom';

import { BackDrop } from 'src/components/layout/BackDrop';
import { CircularProgress } from 'src/components/layout/CircularProgress';
import { Flex } from 'src/components/layout/Flex';

export const FormLoader = () => {
    const { pending: isLoading } = useFormStatus();

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
