'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import React from 'react';

import { Button } from 'src/components/layout/Button';
import { Field, Form, Input } from 'src/components/layout/Form';
import { Link } from 'src/components/navigation/Link';
import { useTranslation } from 'src/contexts/translationContext';

interface InviteTokenFormProps {
    initialCode?: string;
}
export const InviteTokenForm = ({ initialCode }: InviteTokenFormProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const { t } = useTranslation();
    const [inviteCode, setInviteCode] = React.useState(initialCode || '');

    const onSubmit = (e: FormEvent) => {
        if (!inviteCode) {
            return;
        }
        e.preventDefault();
        const params = new URLSearchParams();
        params.set('inviteCode', inviteCode);
        router.replace(`${pathname}?${params.toString()}`);
    };

    return (
        <Form onSubmit={onSubmit} className="signup-form" autoComplete="off" style={{ textAlign: 'left' }}>
            <label style={{ fontWeight: 'bold', fontSize: '1rem' }}>{t('signup_page.invite_code_field.title')}</label>
            <Field
                marginTop="md"
                name="inviteCode"
                label={t('signup_page.invite_code_field.label')}
                input={
                    <Input
                        id="inviteCode"
                        name="inviteCode"
                        type="text"
                        color="secondary"
                        required
                        value={inviteCode}
                        onChange={(e) => {
                            setInviteCode(e.target.value);
                        }}
                        isFullWidth
                        hasError={!!initialCode}
                    />
                }
                helperText={initialCode ? t('signup_page.invite_code_field.error') : ''}
                helperTextStyle={{ textAlign: 'left', color: 'rgb(211, 47, 47)' }}
            ></Field>
            <Button label={t('signup_page.continue_button.label')} variant="contained" color="secondary" type="submit" value="Submit"></Button>
            <div className="text-center" style={{ marginBottom: '2rem' }}>
                {t('signup_page.login_link.already')} <Link href="/login">{t('signup_page.login_link.label')}</Link>
            </div>
        </Form>
    );
};
