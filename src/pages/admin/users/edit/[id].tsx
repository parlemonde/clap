import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import { useUser } from 'src/api/users/users.get';
import { useUpdateUserMutation } from 'src/api/users/users.put';
import { AdminTile } from 'src/components/admin/AdminTile';
import { Breadcrumbs } from 'src/components/layout/Breadcrumbs';
import { Button } from 'src/components/layout/Button';
import { Field, Form, Input } from 'src/components/layout/Form';
import { Modal } from 'src/components/layout/Modal';
import { Title } from 'src/components/layout/Typography';
import { Loader } from 'src/components/ui/Loader';
import { sendToast } from 'src/components/ui/Toasts';
import { getQueryString } from 'src/utils/get-query-string';
import type { User } from 'types/models/user.type';

const AdminEditUser = () => {
    const router = useRouter();

    const userId = React.useMemo(() => Number(getQueryString(router.query.id)) || 0, [router]);
    const { user: fetchedUser } = useUser(userId, { enabled: userId !== 0 });

    const [user, setUser] = React.useState<User | null>(fetchedUser || null);
    const [isBlocked, setIsBlocked] = React.useState<boolean>(true);
    const [isBlockedModalOpen, setIsBlockedModalOpen] = React.useState<boolean>(false);

    React.useEffect(() => {
        setUser(fetchedUser || null);
    }, [fetchedUser]);

    const onChangeValue = (key: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setUser(
            user === null
                ? null
                : {
                      ...user,
                      [key]: key === 'type' ? parseInt(event.target.value, 10) : event.target.value,
                  },
        );
    };

    const updateUserMutation = useUpdateUserMutation();
    const isLoading = updateUserMutation.isLoading;
    const submit = async () => {
        if (user === null || !user.pseudo || !user.email) {
            return;
        }
        try {
            const updatedUser: { pseudo?: string; email?: string; type: number } = {
                type: user.type,
            };
            if (!isBlocked) {
                updatedUser.email = user.email;
                updatedUser.pseudo = user.pseudo;
            }
            await updateUserMutation.mutateAsync({
                userId: user.id,
                ...updatedUser,
            });
            sendToast({ message: 'Utilisateur modifié avec succès!', type: 'success' });
            router.push('/admin/users');
        } catch (err) {
            console.error(err);
            sendToast({ message: 'Une erreur est survenue...', type: 'error' });
        }
    };

    return (
        <div style={{ margin: '24px 32px' }}>
            <Breadcrumbs
                links={[
                    {
                        href: '/admin/users',
                        label: <Title style={{ display: 'inline' }}>Utilisateurs</Title>,
                    },
                ]}
                currentLabel={<Title style={{ display: 'inline' }}>{user?.pseudo || ''}</Title>}
            />

            {user !== null && (
                <AdminTile marginY="md" title="Informations">
                    <Form padding="md" onSubmit={submit}>
                        <Title variant="h3" color="inherit">
                            Identifiants de connexion
                        </Title>
                        <div style={{ margin: '0.5rem 0 2rem 0' }}>
                            <Field
                                name="pseudo"
                                label="Pseudo"
                                input={
                                    <Input
                                        id="pseudo"
                                        name="pseudo"
                                        value={user.pseudo || ''}
                                        color="secondary"
                                        isFullWidth
                                        disabled={isBlocked}
                                        onChange={onChangeValue('pseudo')}
                                    />
                                }
                            ></Field>
                            <Field
                                marginTop="sm"
                                name="email"
                                label="Email"
                                input={
                                    <Input
                                        id="email"
                                        name="email"
                                        value={user.email || ''}
                                        color="secondary"
                                        isFullWidth
                                        disabled={isBlocked}
                                        onChange={onChangeValue('email')}
                                    />
                                }
                            ></Field>
                            {isBlocked && (
                                <Button
                                    label="Changer les identifiants"
                                    marginTop="md"
                                    onClick={() => {
                                        setIsBlockedModalOpen(true);
                                    }}
                                    variant="contained"
                                    color="secondary"
                                    size="sm"
                                ></Button>
                            )}
                        </div>
                        <Title variant="h3" color="inherit">
                            Type de compte
                        </Title>
                        <div style={{ margin: '0.5rem 0 2rem 0' }}>
                            <div style={{ margin: '4px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <input type="radio" id="class" name="account" checked={user.type === 0} value="0" onChange={onChangeValue('type')} />
                                <label htmlFor="class" style={{ cursor: 'pointer' }}>
                                    Compte classe
                                </label>
                            </div>
                            <div style={{ margin: '4px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <input type="radio" id="admin" name="account" value="1" checked={user.type === 1} onChange={onChangeValue('type')} />
                                <label htmlFor="admin" style={{ cursor: 'pointer' }}>
                                    Compte administrateur
                                </label>
                            </div>
                            <div style={{ margin: '4px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <input
                                    type="radio"
                                    id="super-admin"
                                    name="account"
                                    checked={user.type === 2}
                                    value="2"
                                    onChange={onChangeValue('type')}
                                />
                                <label htmlFor="super-admin" style={{ cursor: 'pointer' }}>
                                    Super administrateur
                                </label>
                            </div>
                        </div>
                        <div style={{ width: '100%', textAlign: 'center' }}>
                            <Button label="Modifier" variant="contained" color="secondary" type="submit"></Button>
                        </div>
                    </Form>
                    <Modal
                        isOpen={isBlockedModalOpen}
                        onClose={() => {
                            setIsBlockedModalOpen(false);
                        }}
                        onConfirm={() => {
                            setIsBlocked(false);
                            setIsBlockedModalOpen(false);
                        }}
                        cancelLabel="Annuler"
                        confirmLabel="Changer"
                        title="Modifier les identifiants"
                        isFullWidth
                    >
                        <div>Attention, les identifiants sont nécessaires à la connection ! Êtes vous sur de vouloir les changer ?</div>
                    </Modal>
                </AdminTile>
            )}
            <Link href="/admin/users" passHref>
                <Button label="Retour" as="a" variant="outlined" marginTop="md"></Button>
            </Link>
            <Loader isLoading={isLoading} />
        </div>
    );
};

export default AdminEditUser;
