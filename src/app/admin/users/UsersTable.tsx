'use client';

import { Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import * as React from 'react';

import { Table } from 'src/components/admin/Table';
import { IconButton } from 'src/components/layout/Button/IconButton';
import { Modal } from 'src/components/layout/Modal';
import { Tooltip } from 'src/components/layout/Tooltip';
import { Link } from 'src/components/navigation/Link';
import { userContext } from 'src/contexts/userContext';
import type { User } from 'src/database/schemas/users';

type UsersTableWithDataProps = {
    users: User[];
};

export const UsersTable = ({ users }: UsersTableWithDataProps) => {
    const { user } = React.useContext(userContext);
    const [deleteIndex, setDeleteIndex] = React.useState<number | null>(null);
    const [isDeleting, setIsDeleting] = React.useState(false);

    return (
        <>
            <Table aria-label="tout les thèmes">
                <thead>
                    <tr>
                        <th align="left">Nom</th>
                        <th align="left" style={{ padding: '16px 0' }}>
                            Email
                        </th>
                        <th align="left" style={{ padding: '16px 0' }}>
                            Role
                        </th>
                        <th align="right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length > 0 ? (
                        users.map((u, index) => (
                            <tr key={u.id}>
                                <th style={{ paddingLeft: 16 }}>{u.name}</th>
                                <th>{u.email}</th>
                                <th>{u.role === 'admin' ? 'Admin' : 'Utilisateur'}</th>
                                <th align="right" style={{ minWidth: '96px', paddingRight: 8 }}>
                                    <Tooltip content="Modifier">
                                        <span>
                                            <Link href={`/admin/users/edit/${u.id}`} passHref legacyBehavior>
                                                <IconButton as="a" margin="xs" aria-label="edit" variant="borderless" icon={Pencil1Icon}></IconButton>
                                            </Link>
                                        </span>
                                    </Tooltip>
                                    {user?.id !== u.id && (
                                        <Tooltip content="Supprimer">
                                            <IconButton
                                                marginY="xs"
                                                aria-label="delete"
                                                onClick={() => {
                                                    setDeleteIndex(index);
                                                }}
                                                variant="borderless"
                                                color="error"
                                                icon={TrashIcon}
                                            ></IconButton>
                                        </Tooltip>
                                    )}
                                </th>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <th colSpan={4} align="center" style={{ padding: '8px 0' }}>
                                Cette liste est vide ! <Link href="/admin/themes/new">Ajouter un thème ?</Link>
                            </th>
                        </tr>
                    )}
                </tbody>
            </Table>
            <Modal
                isOpen={deleteIndex !== null}
                onClose={() => {
                    setDeleteIndex(null);
                }}
                onConfirm={async () => {
                    if (deleteIndex === null) {
                        return;
                    }
                    setIsDeleting(true);
                    // await deleteUser(users[deleteIndex].id);
                    setIsDeleting(false);
                    setDeleteIndex(null);
                }}
                confirmLabel="Supprimer"
                confirmLevel="error"
                cancelLabel="Annuler"
                title="Supprimer l'utilisateur ?"
                isFullWidth
                isLoading={isDeleting}
            >
                <p>
                    Voulez-vous vraiment supprimer l'utilisateur <strong>{deleteIndex !== null && users[deleteIndex].name}</strong> ?
                </p>
            </Modal>
        </>
    );
};
