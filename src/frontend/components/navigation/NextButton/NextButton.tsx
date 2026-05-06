'use client';

import { useExtracted } from 'next-intl';
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
    const commonT = useExtracted('common');

    return (
        <Box as="div" className={styles.nextButton} {...marginProps}>
            {backHref && (
                <Button
                    className={styles.nextButton__back}
                    label={commonT('Annuler')}
                    as="a"
                    href={backHref}
                    variant="outlined"
                    color="secondary"
                    marginRight="md"
                ></Button>
            )}
            <Button
                className={styles.nextButton__next}
                label={label || commonT('Suivant')}
                variant="contained"
                color="secondary"
                type={type}
                onClick={onNext}
                disabled={isDisabled}
            ></Button>
        </Box>
    );
};
