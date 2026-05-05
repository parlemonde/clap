'use client';

import { useTranslations } from 'next-intl';
import React from 'react';

import { Button } from '@frontend/components/layout/Button';
import { Loader } from '@frontend/components/ui/Loader';
import { logout } from '@server-actions/authentication/logout';

export const LogoutForm = () => {
    const t = useTranslations();
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
                label={t('my_account_page.logout_button.label')}
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
