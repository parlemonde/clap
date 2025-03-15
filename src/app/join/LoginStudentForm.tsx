'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { loginForStudent } from 'src/actions/authentication/login-for-student';
import { Button } from 'src/components/layout/Button';
import { Field, Form, Input } from 'src/components/layout/Form';
import { FormLoader } from 'src/components/ui/Loader';
import { setToLocalStorage } from 'src/hooks/useLocalStorage/local-storage';

export const LoginStudentForm = () => {
    const router = useRouter();
    const [message, setMessage] = React.useState('');
    const [projectCode, setProjectCode] = React.useState('');

    const onSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        const result = await loginForStudent(projectCode);
        if ('errorMessage' in result) {
            setMessage(result.errorMessage);
        } else {
            setToLocalStorage('projectId', result.projectId);
            router.push('/create/2-questions');
        }
    };

    return (
        <Form className="login-form" onSubmit={onSubmit}>
            {message && <span style={{ color: 'rgb(211, 47, 47)', display: 'block' }}>{message}</span>}
            <Field
                name="projectCode"
                label={<span style={{ display: 'inline-block', marginBottom: 4 }}>Code de collaboration</span>}
                input={
                    <Input
                        id="projectCode"
                        name="projectCode"
                        type="text"
                        color="secondary"
                        isFullWidth
                        required
                        value={projectCode}
                        onChange={(ev) => setProjectCode(ev.target.value)}
                    />
                }
            ></Field>
            <Button label="Rejoindre" variant="contained" color="secondary" type="submit" value="Submit"></Button>
            <div className="text-center">
                <Link href="/login" className="color-primary">
                    Retour à la page de connexion
                </Link>
            </div>
            <div className="loader-wrapper">
                <FormLoader />
            </div>
        </Form>
    );
};
