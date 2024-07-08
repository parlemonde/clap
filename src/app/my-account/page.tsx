import * as React from 'react';

import { logout } from 'src/actions/authentication/logout';
import { getCurrentUser } from 'src/actions/get-current-user';
import { getTranslation } from 'src/actions/get-translation';
import { Button } from 'src/components/layout/Button';
import { Container } from 'src/components/layout/Container';
import { Divider } from 'src/components/layout/Divider';
import { Title } from 'src/components/layout/Typography';
import { FormLoader } from 'src/components/ui/Loader';

export default async function AccountPage() {
    const { t } = await getTranslation();
    const user = await getCurrentUser();

    if (!user) {
        return null;
    }

    return (
        <Container>
            <div className="text-center">
                <Title color="primary" variant="h1" marginY="md">
                    {t('my_account')}
                </Title>
            </div>
            <Title color="inherit" variant="h2">
                {t('account_connexion_title')}
            </Title>
            <div style={{ marginTop: '0.5rem' }}>
                <label>
                    <strong>{t('signup_pseudo')} : </strong>
                </label>
                {user.name} -{' '}
                {/* <a
                    tabIndex={0}
                    className="color-primary"
                    onKeyDown={(event) => {
                        if (event.key === ' ' || event.key === 'Enter') {
                            // TODO
                        }
                    }}
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => {
                        // TODO
                    }}
                >
                    {t('account_change_button')}
                </a> */}
            </div>
            <div style={{ marginTop: '4px' }}>
                <label>
                    <strong>{t('signup_email')} : </strong>
                </label>
                {user.email}
                {/* {user.accountRegistration < 10 && (
                    <>
                        {' '}
                        -{' '}
                        <a
                            tabIndex={0}
                            className="color-primary"
                            onKeyDown={(event) => {
                                if (event.key === ' ' || event.key === 'Enter') {
                                    openModal(2)();
                                }
                            }}
                            style={{ cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={openModal(2)}
                        >
                            {t('account_change_button')}
                        </a>
                    </>
                )} */}
            </div>
            {/* {user.accountRegistration < 10 && (
                <Button
                    label={t('account_password_change')}
                    style={{ marginTop: '0.8rem' }}
                    className="mobile-full-width"
                    onClick={openModal(3)}
                    variant="contained"
                    color="secondary"
                    size="sm"
                    marginTop="md"
                ></Button>
            )} */}
            <Divider marginY="lg" />
            <Title color="inherit" variant="h2">
                {t('logout_button')}
            </Title>
            <form action={logout} style={{ width: '100%' }}>
                <Button
                    style={{ marginTop: '0.8rem' }}
                    label={t('logout_button')}
                    variant="outlined"
                    color="error"
                    className="mobile-full-width"
                    type="submit"
                    size="sm"
                ></Button>
                <FormLoader />
            </form>
            <Divider marginY="lg" />
            <Title color="inherit" variant="h2">
                {t('my_account')}
            </Title>
            <Button
                label={t('account_delete_button')}
                style={{ marginTop: '0.8rem' }}
                className="mobile-full-width"
                // onClick={openModal(5)}
                variant="contained"
                color="error"
                size="sm"
                marginTop="sm"
            ></Button>
        </Container>
    );
}
