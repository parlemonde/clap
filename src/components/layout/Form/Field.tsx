import * as React from 'react';

import { Flex } from '../Flex';
import { Text } from '../Typography';
import type { MarginProps, PaddingProps } from '../css-styles';

type FieldProps = {
    name: string;
    label?: React.ReactNode;
    input: React.ReactNode;
    helperText?: string;
    helperTextStyle?: React.CSSProperties;
    className?: string;
    style?: React.CSSProperties;
} & MarginProps &
    PaddingProps;
export const Field = ({ name, label, input, className, style, helperText, helperTextStyle = {}, ...marginAndPaddingProps }: FieldProps) => {
    return (
        <Flex
            {...marginAndPaddingProps}
            flexDirection="column"
            alignItems="flex-start"
            justifyContent="flex-start"
            className={className}
            style={style}
        >
            {label && <label htmlFor={name}>{label}</label>}
            {input}
            {helperText && (
                <Text
                    variant="p"
                    marginTop="xs"
                    paddingX="sm"
                    style={{
                        color: 'rgba(0, 0, 0, 0.6)',
                        fontSize: 12,
                        textAlign: 'right',
                        width: '100%',
                        boxSizing: 'border-box',
                        ...helperTextStyle,
                    }}
                >
                    {helperText}
                </Text>
            )}
        </Flex>
    );
};
