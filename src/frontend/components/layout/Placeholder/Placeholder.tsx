import classNames from 'clsx';
import * as React from 'react';

import styles from './placeholder.module.css';

type PlaceholderProps = {
    variant?: 'block' | 'text';
    width?: React.CSSProperties['width'];
    height?: React.CSSProperties['height'];
    className?: string;
    style?: React.CSSProperties;
};
export const Placeholder = ({ variant = 'block', width, height, className, style = {} }: PlaceholderProps) => {
    return (
        <span
            className={classNames(styles.placeholder, className, {
                [styles['placeholder--text']]: variant === 'text',
            })}
            style={{ width, height, ...style }}
        />
    );
};
