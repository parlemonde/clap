'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import type { FormEvent } from 'react';
import React from 'react';

import { Button } from '@frontend/components/layout/Button';
import { Field, Form, Input } from '@frontend/components/layout/Form';
import { Link } from '@frontend/components/navigation/Link';

interface InviteTokenFormProps {
    initialCode?: string;
}
export const InviteTokenForm = ({ initialCode }: InviteTokenFormProps) => {
    const router = useRouter();
    const pathname = usePathname();

    const tx = useExtracted('sign-up.InviteTokenForm');
    const commonT = useExtracted('common');
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
            <label style={{ fontWeight: 'bold', fontSize: '1rem' }}>{tx("Créez votre compte classe avec votre code d'invitation :")}</label>
            <Field
                marginTop="md"
                name="inviteCode"
                label={tx("Saisir votre code d'invitation")}
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
                helperText={initialCode ? tx("Code d'invitation invalide...") : ''}
                helperTextStyle={{ textAlign: 'left', color: 'rgb(211, 47, 47)' }}
            ></Field>
            <Button label={commonT('Continuer')} variant="contained" color="secondary" type="submit" value="Submit"></Button>
            <div className="text-center" style={{ marginBottom: '2rem' }}>
                {tx('Compte déjà créé ?')} <Link href="/login">{tx('Se connecter')}</Link>
            </div>
        </Form>
    );
};
