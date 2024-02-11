import classNames from 'classnames';
import * as React from 'react';

import styles from './container.module.scss';
import type { Size } from '../css-styles';
import { getSize } from '../css-styles';

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
