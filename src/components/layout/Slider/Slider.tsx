'use client';

import * as RadixSlider from '@radix-ui/react-slider';
import classNames from 'classnames';
import React from 'react';

import styles from './slider.module.scss';
import type { MarginProps } from '../css-styles';
import { getMarginAndPaddingStyle } from '../css-styles';

type SliderProps = {
    value: number;
    min?: number;
    max?: number;
    step?: number;
    ariaLabel?: string;
    orientation?: 'horizontal' | 'vertical';
    onChange?: (newValue: number) => void;
    style?: React.CSSProperties;
    className?: string;
} & MarginProps;
export const Slider = ({
    value,
    min = 0,
    max = 100,
    step = 1,
    ariaLabel = 'Volume',
    orientation = 'horizontal',
    onChange = () => {},
    className,
    style,
    ...marginProps
}: SliderProps) => (
    <RadixSlider.Root
        className={classNames(styles.Slider, className)}
        value={[value]}
        onValueChange={(newValues: number[]) => {
            if (newValues.length === 1) {
                onChange(newValues[0]);
            }
        }}
        min={min}
        max={max}
        step={step}
        orientation={orientation}
        style={{ ...style, ...getMarginAndPaddingStyle(marginProps) }}
    >
        <RadixSlider.Track className={styles.Slider__Track}>
            <RadixSlider.Range className={styles.Slider__Range} />
        </RadixSlider.Track>
        <RadixSlider.Thumb
            className={styles.Slider__Thumb}
            aria-label={ariaLabel}
            onMouseLeave={() => {
                if (document && document.activeElement && document.activeElement instanceof HTMLSpanElement) {
                    document.activeElement.blur();
                }
            }}
        >
            <span className={styles.Slider__ThumbValue}>{value}</span>
        </RadixSlider.Thumb>
    </RadixSlider.Root>
);
