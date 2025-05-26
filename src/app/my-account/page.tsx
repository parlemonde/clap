import * as React from 'react';

import { DeleteAccountButton } from './DeleteAccountButton';
import { LogoutForm } from './LogoutForm';
import { UpdateEmailForm } from './UpdateEmailForm';
import { UpdateNameForm } from './UpdateNameForm';
import { UpdatePasswordButton } from './UpdatePasswordButton';
import { getCurrentUser } from 'src/actions/get-current-user';
import { getTranslation } from 'src/actions/get-translation';
import { Container } from 'src/components/layout/Container';
import { Divider } from 'src/components/layout/Divider';
import { Title } from 'src/components/layout/Typography';

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
                    {t('my_account_page.header.title')}
                </Title>
            </div>
            <Title color="inherit" variant="h2">
                {t('my_account_page.connection_subheader.title')}
            </Title>
            <div style={{ marginTop: '0.5rem' }}>
                <label>
                    <strong>{t('my_account_page.name_field.label')} : </strong>
                </label>
                {user.name} - <UpdateNameForm user={user} />
            </div>
            <div style={{ marginTop: '4px' }}>
                <label>
                    <strong>{t('my_account_page.email_field.label')} : </strong>
                </label>
                {user.email} - <UpdateEmailForm user={user} />
            </div>
            {!user.useSSO && <UpdatePasswordButton />}
            <Divider marginY="lg" />
            <Title color="inherit" variant="h2">
                {t('my_account_page.logout_button.title')}
            </Title>
            <LogoutForm />
            <Divider marginY="lg" />
            <Title color="inherit" variant="h2">
                {t('my_account_page.delete_account_button.title')}
            </Title>
            <DeleteAccountButton />
        </Container>
    );
}
