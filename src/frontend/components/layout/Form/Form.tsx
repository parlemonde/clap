'use client';
import * as React from 'react';
import type { JSX } from 'react';

import type { MarginProps, PaddingProps } from '@frontend/components/layout/css-styles';
import { getMarginAndPaddingProps, getMarginAndPaddingStyle } from '@frontend/components/layout/css-styles';

type FormProps = Omit<JSX.IntrinsicElements['form'], 'ref'> &
    MarginProps &
    PaddingProps & {
        preventSubmit?: boolean;
    };
export const Form = ({ children, preventSubmit, style = {}, ...props }: React.PropsWithChildren<FormProps>) => {
    const { marginAndPaddingProps, otherProps } = getMarginAndPaddingProps(props);
    return (
        <form
            onSubmit={
                preventSubmit
                    ? (event) => {
                          event.preventDefault();
                      }
                    : undefined
            }
            {...otherProps}
            style={{ ...style, ...getMarginAndPaddingStyle(marginAndPaddingProps) }}
        >
            {children}
        </form>
    );
};
