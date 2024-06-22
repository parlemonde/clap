'use client';

import { redirect } from 'next/navigation';
import * as React from 'react';
import { useFormState } from 'react-dom';

import { login } from 'src/actions/authentication/login';
import { useTranslation } from 'src/contexts/translationContext';
import { userContext } from 'src/contexts/userContext';

export default function LoginPage() {
    const [message, formAction] = useFormState(login, '');
    const { t } = useTranslation();

    const { user } = React.useContext(userContext);
    if (user) {
        redirect('/');
    }

    return (
        <div>
            <p>LOGIN</p>
            <form action={formAction}>
                <div>
                    <label htmlFor="email">Email</label>
                    <input type="text" name="email" id="email" autoComplete="email" />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input type="password" name="password" id="password" />
                </div>

                <button type="submit">{t('login')}</button>
                {message}
            </form>
        </div>
    );
}
