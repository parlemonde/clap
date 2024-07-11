import classNames from 'classnames';
import * as React from 'react';

import styles from './table.module.scss';

type TableProps = React.TableHTMLAttributes<HTMLTableElement>;

const TableWithRef = ({ children, className, ...props }: TableProps, ref: React.ForwardedRef<HTMLTableElement>) => {
    return (
        <table {...props} ref={ref} className={classNames(styles.Table, className)}>
            {children}
        </table>
    );
};

export const Table = React.forwardRef(TableWithRef);
