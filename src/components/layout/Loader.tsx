import React from 'react';

import { Backdrop, CircularProgress } from '@mui/material';

type LoaderProps = {
    isLoading: boolean;
};
export const Loader = ({ isLoading }: LoaderProps) => (
    <Backdrop style={{ zIndex: 2000, color: 'white' }} open={isLoading}>
        <CircularProgress color="inherit" />
    </Backdrop>
);
