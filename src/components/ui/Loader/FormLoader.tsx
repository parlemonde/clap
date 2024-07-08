'use client';
import * as React from 'react';
import { useFormStatus } from 'react-dom';

import { Loader } from './Loader';

export const FormLoader = () => {
    const { pending } = useFormStatus();

    return <Loader isLoading={pending} />;
};
