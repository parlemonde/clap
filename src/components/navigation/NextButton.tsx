import Link from 'next/link';
import React from 'react';

import ArrowForwardIcon from '@mui/icons-material/ArrowForwardIos';
import { Box, Button } from '@mui/material';

import { useTranslation } from 'src/i18n/useTranslation';

type NextButtonProps = {
    label?: string;
    backHref?: string;
    onNext: () => void | Promise<void>;
};
export const NextButton = ({ label, backHref, onNext }: NextButtonProps) => {
    const { t } = useTranslation();

    return (
        <div style={{ marginTop: '2rem' }}>
            <Box sx={{ display: { xs: 'none', md: 'block' } }} style={{ width: '100%', textAlign: 'right' }}>
                {backHref && (
                    <Link href={backHref} passHref>
                        <Button component="a" variant="outlined" color="secondary" style={{ marginRight: '1rem' }}>
                            {t('cancel')}
                        </Button>
                    </Link>
                )}
                <Button variant="contained" color="secondary" onClick={onNext} endIcon={<ArrowForwardIcon />}>
                    {label || t('next')}
                </Button>
            </Box>
            <Button
                sx={{ display: { xs: 'inline-flex', md: 'none' } }}
                variant="contained"
                color="secondary"
                style={{ width: '100%', marginTop: '2rem' }}
                onClick={onNext}
            >
                {label || t('next')}
            </Button>
        </div>
    );
};
