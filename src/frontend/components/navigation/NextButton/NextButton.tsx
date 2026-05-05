'use client';

import { useTranslations } from 'next-intl';
import * as React from 'react';

import type { MarginProps } from '@frontend/components/layout';
import { Box } from '@frontend/components/layout/Box';
import { Button } from '@frontend/components/layout/Button';

import styles from './next-button.module.css';

type NextButtonProps = {
    label?: string;
    backHref?: string;
    type?: 'button' | 'submit' | 'reset';
    onNext?: () => void | Promise<void>;
    isDisabled?: boolean;
} & MarginProps;

export const NextButton = ({ label, backHref, type, onNext, isDisabled, ...marginProps }: NextButtonProps) => {
    const t = useTranslations();

    return (
        <Box as="div" className={styles.nextButton} {...marginProps}>
            {backHref && (
                <Button
                    className={styles.nextButton__back}
                    label={t('common.actions.cancel')}
                    as="a"
                    href={backHref}
                    variant="outlined"
                    color="secondary"
                    marginRight="md"
                ></Button>
            )}
            <Button
                className={styles.nextButton__next}
                label={label || t('common.actions.next')}
                variant="contained"
                color="secondary"
                type={type}
                onClick={onNext}
                disabled={isDisabled}
            ></Button>
        </Box>
    );
};
