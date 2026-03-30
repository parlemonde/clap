import classNames from 'clsx';
import * as React from 'react';
import type { JSX } from 'react';

import type { Size } from '@frontend/components/layout/css-styles';
import { getSize } from '@frontend/components/layout/css-styles';

import styles from './container.module.scss';

type ContainerProps = Omit<JSX.IntrinsicElements['main'], 'ref'> & {
    paddingBottom?: Size | number | 'none' | 'auto';
    paddingTop?: Size | number | 'none' | 'auto';
};
export const Container = ({ children, className, paddingBottom, paddingTop, ...props }: React.PropsWithChildren<ContainerProps>) => {
    return (
        <main
            {...props}
            className={classNames(className, styles.container)}
            style={{ paddingBottom: getSize(paddingBottom), paddingTop: getSize(paddingTop), ...props.style }}
        >
            {children}
        </main>
    );
};
