'use client';

import { ChevronLeftIcon } from '@radix-ui/react-icons';
import classNames from 'clsx';
import * as React from 'react';

import { Button } from '@frontend/components/layout/Button';
import { useTranslation } from '@frontend/contexts/translationContext';

import styles from './back-button.module.css';

type BackButtonProps = {
    href: string;
    label?: string;
    onClick?: () => void;
    className?: string;
    style?: React.CSSProperties;
};

export const BackButton = ({ href, label = 'common.actions.back', onClick, className, style }: BackButtonProps) => {
    const { t } = useTranslation();
    return (
        <Button
            color="primary"
            variant="borderless"
            label={t(label)}
            className={classNames(styles.backButton, className)}
            as="a"
            href={href}
            style={style}
            size="md"
            onClick={() => {
                if (onClick) {
                    onClick();
                }
            }}
            leftIcon={<ChevronLeftIcon />}
        ></Button>
    );
};
