'use client';

import classNames from 'classnames';
import * as React from 'react';

import styles from './select.module.scss';
import type { MarginProps } from '../css-styles';
import { getMarginAndPaddingProps, getMarginAndPaddingStyle } from '../css-styles';

type SelectProps = {
    color?: 'primary' | 'secondary';
    isFullWidth?: boolean;
    size?: 'sm' | 'md' | 'lg';
    width?: React.CSSProperties['width'];
} & Omit<JSX.IntrinsicElements['select'], 'ref' | 'size'> &
    MarginProps;
const SelectComponent = (
    { color = 'primary', isFullWidth, width = '300px', size = 'md', className, style = {}, children, ...props }: SelectProps,
    ref: React.ForwardedRef<HTMLSelectElement | null>,
) => {
    const { marginAndPaddingProps, otherProps } = getMarginAndPaddingProps(props);

    return (
        <div
            style={{ width: isFullWidth ? undefined : width }}
            className={classNames(styles.select__container, { [styles['select__container--is-full-width']]: isFullWidth })}
        >
            <select
                ref={ref}
                {...otherProps}
                className={classNames(styles.select, styles[`select--${color}`], styles[`select--${size}`], className)}
                style={{ ...getMarginAndPaddingStyle(marginAndPaddingProps), ...style }}
            >
                {children}
            </select>
            <svg className={styles.select__arrow} width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 10l5 5 5-5z" fill="currentColor"></path>
            </svg>
        </div>
    );
};

export const Select = React.forwardRef<HTMLSelectElement | null, SelectProps>(SelectComponent);
