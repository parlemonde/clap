'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { updateUserById } from 'src/actions/users/update-user';
import { Button } from 'src/components/layout/Button';
import { Field, Form, Input } from 'src/components/layout/Form';
import { Select } from 'src/components/layout/Form/Select';
import { Title } from 'src/components/layout/Typography';
import { Loader } from 'src/components/ui/Loader';
import { sendToast } from 'src/components/ui/Toasts';
import { userContext } from 'src/contexts/userContext';
import type { User } from 'src/database/schemas/users';

type EditUserFormProps = {
    user: User;
};

export const EditUserForm = ({ user }: EditUserFormProps) => {
    const router = useRouter();
    const { user: currentUser } = React.useContext(userContext);

    const [name, setName] = React.useState(user.name);
    const [email, setEmail] = React.useState(user.email);
    const [role, setRole] = React.useState(user.role);
    const isRoleUpdateDisabled = currentUser?.id === user.id;

    const [isLoading, setIsLoading] = React.useState(false);
    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user.email) {
            sendToast({ message: 'Email invalide', type: 'error' });
            return;
        }
        if (!user.name) {
            sendToast({ message: 'Nom invalide', type: 'error' });
            return;
        }

        try {
            setIsLoading(true);
            await updateUserById(user.id, {
                email,
                name,
                role,
            });
            sendToast({ message: 'Utilisateur mis à jour avec succès!', type: 'success' });
            setIsLoading(false);
            router.push('/admin/users');
        } catch (err) {
            console.error(err);
            sendToast({ message: 'Une erreur est survenue...', type: 'error' });
            setIsLoading(false);
        }
    };

    return (
        <>
            <Form onSubmit={onSubmit} padding="md">
                <Field
                    name="username"
                    label={
                        <Title variant="h3" color="primary">
                            Nom :
                        </Title>
                    }
                    input={
                        <Input
                            name="username"
                            id="username"
                            value={name}
                            required
                            isFullWidth
                            autoComplete="off"
                            onChange={(event) => {
                                setName(event.target.value);
                            }}
                        />
                    }
                    marginBottom="md"
                ></Field>
                <Field
                    name="email"
                    label={
                        <Title variant="h3" color="primary">
                            Email :
                        </Title>
                    }
                    input={
                        <Input
                            name="email"
                            id="email"
                            isFullWidth
                            required
                            autoComplete="off"
                            value={email}
                            onChange={(event) => {
                                setEmail(event.target.value);
                            }}
                        />
                    }
                    marginBottom="md"
                ></Field>
                <Field
                    name="role"
                    label={
                        <Title variant="h3" color="primary">
                            Role :
                        </Title>
                    }
                    input={
                        <Select
                            name="role"
                            id="role"
                            isFullWidth
                            value={role}
                            disabled={isRoleUpdateDisabled}
                            onChange={(event) => {
                                const newRole = event.target.value;
                                if (newRole === 'admin' || newRole === 'teacher') {
                                    setRole(newRole);
                                } else {
                                    sendToast({ message: 'Role invalide', type: 'error' });
                                }
                            }}
                        >
                            <option value="admin">Admin</option>
                            <option value="teacher">Utilisateur</option>
                        </Select>
                    }
                    marginBottom="md"
                ></Field>
                <div style={{ width: '100%', textAlign: 'center', marginTop: '16px' }}>
                    <Button label="Modifier l'utilisateur !" color="secondary" variant="contained" type="submit"></Button>
                </div>
            </Form>
            <Loader isLoading={isLoading} />
        </>
    );
};
