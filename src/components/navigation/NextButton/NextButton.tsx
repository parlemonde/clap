import Link from 'next/link';
import * as React from 'react';

import styles from './next-button.module.scss';
import type { MarginProps } from 'src/components/layout';
import { Box } from 'src/components/layout/Box';
import { Button } from 'src/components/layout/Button';
import { useTranslation } from 'src/i18n/useTranslation';

type NextButtonProps = {
    label?: string;
    backHref?: string;
    type?: 'button' | 'submit' | 'reset';
    onNext?: () => void | Promise<void>;
} & MarginProps;

export const NextButton = ({ label, backHref, type, onNext, ...marginProps }: NextButtonProps) => {
    const { t } = useTranslation();

    return (
        <Box as="div" className={styles.nextButton} {...marginProps}>
            {backHref && (
                <Link href={backHref} passHref legacyBehavior>
                    <Button
                        className={styles.nextButton__back}
                        label={t('cancel')}
                        as="a"
                        variant="outlined"
                        color="secondary"
                        marginRight="md"
                    ></Button>
                </Link>
            )}
            <Button
                className={styles.nextButton__next}
                label={label || t('next')}
                variant="contained"
                color="secondary"
                type={type}
                onClick={onNext} /**endIcon={<ArrowForwardIcon />} **/
            ></Button>
        </Box>
    );
};
