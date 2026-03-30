import * as React from 'react';

import { getMarginAndPaddingStyle } from '@frontend/components/layout/css-styles';

import type { MarginProps, PaddingProps } from '..';

type TextProps = {
    variant?: 'span' | 'p';
    weight?: React.CSSProperties['fontWeight'];
    className?: string;
    style?: React.CSSProperties;
} & MarginProps &
    PaddingProps;
export const Text = ({
    variant = 'span',
    weight = 'normal',
    className,
    style = {},
    children,
    ...marginAndPaddingProps
}: React.PropsWithChildren<TextProps>) => {
    return React.createElement(
        variant,
        {
            style: {
                ...style,
                fontWeight: weight,
                ...getMarginAndPaddingStyle(marginAndPaddingProps),
            },
            className,
        },
        children,
    );
};
