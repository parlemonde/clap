import type { ReactElement } from 'react';
import React from 'react';

import useScrollTrigger from '@mui/material/useScrollTrigger';

interface ElevationScrollProps {
    children: ReactElement;
}

const ElevationScroll: React.FunctionComponent<ElevationScrollProps> = ({ children }: ElevationScrollProps) => {
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 0,
    });
    return React.cloneElement(children, {
        elevation: trigger ? 4 : 0,
    });
};

export default ElevationScroll;
