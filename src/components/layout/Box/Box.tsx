import React, { type JSX } from 'react';

import type { MarginProps, PaddingProps } from '../css-styles';
import { getMarginAndPaddingProps, getMarginAndPaddingStyle } from '../css-styles';

type BoxProps<T extends keyof JSX.IntrinsicElements = 'div'> = { as?: T } & Omit<JSX.IntrinsicElements[T], 'ref' | 'key'> &
    MarginProps &
    PaddingProps;

export const Box = <T extends keyof JSX.IntrinsicElements = 'div'>({ children, as, style = {}, ...props }: React.PropsWithChildren<BoxProps<T>>) => {
    const { marginAndPaddingProps, otherProps } = getMarginAndPaddingProps(props);
    return React.createElement(
        as || 'div',
        {
            ...otherProps,
            style: {
                ...style,
                ...getMarginAndPaddingStyle(marginAndPaddingProps), // TODO: use classnames
            },
        },
        children,
    );
};
