'use client';

import { Pencil1Icon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, ArrowUpIcon, ArrowDownIcon } from '@radix-ui/react-icons';
import * as React from 'react';

import { deleteUserById } from 'src/actions/users/delete-user';
import { Table } from 'src/components/admin/Table';
import { Button } from 'src/components/layout/Button';
import { IconButton } from 'src/components/layout/Button/IconButton';
import { Input } from 'src/components/layout/Form';
import { Select } from 'src/components/layout/Form/Select';
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
    const [search, setSearch] = React.useState('');
    const [limit, setLimit] = React.useState(10);
    const [page, setPage] = React.useState(1);
    const [order, setOrder] = React.useState<'name' | 'email' | 'role'>('name');
    const [sort, setSort] = React.useState<'asc' | 'desc'>('asc');

    const filteredUsers = users.filter(
        (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()),
    );
    const total = filteredUsers.length;
    const sortedUsers = filteredUsers.sort((a, b) => {
        if (sort === 'asc') {
            return a[order] > b[order] ? 1 : -1;
        } else {
            return a[order] < b[order] ? 1 : -1;
        }
    });
    const usersToDisplay = sortedUsers.slice((page - 1) * limit, page * limit);

    // Reset page if it's out of bounds
    if (page !== 1 && page > Math.ceil(total / limit)) {
        setPage(1);
    }

    return (
        <>
            <div style={{ margin: '8px' }}>
                <Input
                    size="sm"
                    color="secondary"
                    type="search"
                    isFullWidth
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                    }}
                    placeholder="Rechercher..."
                />
            </div>
            <Table aria-label="tout les thèmes">
                <thead>
                    <tr>
                        <th align="left">
                            <Tooltip content="Trier par nom">
                                <Button
                                    label="Nom"
                                    variant="borderless"
                                    style={{ padding: '4px', fontWeight: 600, transform: 'translateX(-4px)' }}
                                    isUpperCase={false}
                                    onClick={() => {
                                        setOrder('name');
                                        setSort(sort === 'asc' ? 'desc' : 'asc');
                                    }}
                                    rightIcon={
                                        order === 'name' ? (
                                            sort === 'asc' ? (
                                                <ArrowUpIcon style={{ height: '20px', width: '20px', marginLeft: 8 }} />
                                            ) : (
                                                <ArrowDownIcon style={{ height: '20px', width: '20px', marginLeft: 8 }} />
                                            )
                                        ) : undefined
                                    }
                                ></Button>
                            </Tooltip>
                        </th>
                        <th align="left" style={{ padding: '16px 0' }}>
                            <Tooltip content="Trier par email">
                                <Button
                                    label="Email"
                                    variant="borderless"
                                    style={{ padding: '4px', fontWeight: 600, transform: 'translateX(-4px)' }}
                                    isUpperCase={false}
                                    onClick={() => {
                                        setOrder('email');
                                        setSort(sort === 'asc' ? 'desc' : 'asc');
                                    }}
                                    rightIcon={
                                        order === 'email' ? (
                                            sort === 'asc' ? (
                                                <ArrowUpIcon style={{ height: '20px', width: '20px', marginLeft: 8 }} />
                                            ) : (
                                                <ArrowDownIcon style={{ height: '20px', width: '20px', marginLeft: 8 }} />
                                            )
                                        ) : undefined
                                    }
                                ></Button>
                            </Tooltip>
                        </th>
                        <th align="left" style={{ padding: '16px 0' }}>
                            <Tooltip content="Trier par role">
                                <Button
                                    label="Role"
                                    variant="borderless"
                                    style={{ padding: '4px', fontWeight: 600, transform: 'translateX(-4px)' }}
                                    isUpperCase={false}
                                    onClick={() => {
                                        setOrder('role');
                                        setSort(sort === 'asc' ? 'desc' : 'asc');
                                    }}
                                    rightIcon={
                                        order === 'role' ? (
                                            sort === 'asc' ? (
                                                <ArrowUpIcon style={{ height: '20px', width: '20px', marginLeft: 8 }} />
                                            ) : (
                                                <ArrowDownIcon style={{ height: '20px', width: '20px', marginLeft: 8 }} />
                                            )
                                        ) : undefined
                                    }
                                ></Button>
                            </Tooltip>
                        </th>
                        <th align="right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {usersToDisplay.map((u, index) => (
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
                    ))}
                    <tr style={{ backgroundColor: 'white' }}>
                        <th colSpan={4} align="right">
                            <span style={{ marginRight: 16 }}>Lignes par pages:</span>
                            <Select
                                value={limit}
                                onChange={(e) => {
                                    setLimit(Number(e.target.value));
                                }}
                                style={{
                                    borderTop: 'none',
                                    borderLeft: 'none',
                                    borderRight: 'none',
                                    borderRadius: 0,
                                    padding: '4px 26px 4px 4px',
                                    fontWeight: 400,
                                    fontSize: '14px',
                                    lineHeight: '20px',
                                }}
                                width="unset"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </Select>
                            <span style={{ margin: '0 16px' }}>
                                {total === 0 ? 0 : (page - 1) * limit + 1}-{Math.min(total, page * limit)} sur {total}
                            </span>
                            <IconButton
                                marginY="xs"
                                marginLeft="sm"
                                aria-label="previous"
                                onClick={() => {
                                    setPage(page - 1);
                                }}
                                variant="borderless"
                                disabled={page === 1}
                                icon={ChevronLeftIcon}
                            ></IconButton>
                            <IconButton
                                marginY="xs"
                                marginRight="sm"
                                aria-label="next"
                                onClick={() => {
                                    setPage(page + 1);
                                }}
                                disabled={page * limit >= total}
                                variant="borderless"
                                icon={ChevronRightIcon}
                            ></IconButton>
                        </th>
                    </tr>
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
                    await deleteUserById(users[deleteIndex].id);
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
