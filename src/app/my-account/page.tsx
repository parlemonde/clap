import * as React from 'react';

import { DeleteAccountButton } from './DeleteAccountButton';
import { UpdateEmailForm } from './UpdateEmailForm';
import { UpdateNameForm } from './UpdateNameForm';
import { UpdatePasswordButton } from './UpdatePasswordButton';
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

    if (!user || user.role === 'student') {
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
                    <strong>{t('signup_name')} : </strong>
                </label>
                {user.name} - <UpdateNameForm user={user} />
            </div>
            <div style={{ marginTop: '4px' }}>
                <label>
                    <strong>{t('signup_email')} : </strong>
                </label>
                {user.email} - <UpdateEmailForm user={user} />
            </div>
            <UpdatePasswordButton />
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
            <DeleteAccountButton />
        </Container>
    );
}
