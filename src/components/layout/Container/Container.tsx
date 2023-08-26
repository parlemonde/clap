import classNames from 'classnames';
import * as React from 'react';

import styles from './container.module.scss';

type ContainerProps = Omit<JSX.IntrinsicElements['div'], 'ref'>;
export const Container = ({ children, className, ...props }: React.PropsWithChildren<ContainerProps>) => {
    return (
        <div {...props} className={classNames(className, styles.container)}>
            {children}
        </div>
    );
};
