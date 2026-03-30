'use client';

import { usePathname } from 'next/navigation';
import * as React from 'react';
import PelicoSVG from 'src/svg/pelico.svg';

import { Box } from '@frontend/components/layout/Box';
import { Link as NextLink } from '@frontend/components/navigation/Link';

import styles from './navigation-logo.module.scss';

export const NavigationLogo = () => {
    const currentPath = usePathname();

    return (
        <NextLink
            href="/"
            className={styles.logo}
            data-active={currentPath === '/' ? '' : undefined}
            aria-current={currentPath === '/' ? 'page' : undefined}
            aria-label="logo"
        >
            <PelicoSVG style={{ height: '36px', width: 'auto' }} />
            <Box as="span" marginLeft="md">
                Clap!
            </Box>
        </NextLink>
    );
};
