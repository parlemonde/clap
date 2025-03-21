'use client';

import React from 'react';

import { logout } from 'src/actions/authentication/logout';
import { Button } from 'src/components/layout/Button';
import { Loader } from 'src/components/ui/Loader';
import { useTranslation } from 'src/contexts/translationContext';

export const LogoutForm = () => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = React.useState(false);

    return (
        <form
            style={{ width: '100%' }}
            onSubmit={async (ev) => {
                ev.preventDefault();
                setIsLoading(true);
                try {
                    await logout();
                } catch (e) {
                    console.error(e);
                }
                setIsLoading(false);
            }}
        >
            <Button
                style={{ marginTop: '0.8rem' }}
                label={t('logout_button')}
                variant="outlined"
                color="error"
                className="mobile-full-width"
                type="submit"
                size="sm"
            ></Button>
            <Loader isLoading={isLoading} />
        </form>
    );
};
