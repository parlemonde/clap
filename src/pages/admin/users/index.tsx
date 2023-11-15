import { Pencil1Icon, TrashIcon, PlusCircledIcon, ChevronLeftIcon, ChevronRightIcon, ArrowUpIcon, ArrowDownIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import React from 'react';

import type { GETParams as GetUsersArgs } from 'src/api/users/users.list';
import { useUsers } from 'src/api/users/users.list';
import { AdminTile } from 'src/components/admin/AdminTile';
import { Table } from 'src/components/admin/Table';
import { DeleteUserModal } from 'src/components/admin/users/DeleteUserModal';
import { InviteUserModal } from 'src/components/admin/users/InviteUserModal';
import { Button } from 'src/components/layout/Button';
import { IconButton } from 'src/components/layout/Button/IconButton';
import { Select } from 'src/components/layout/Form/Select';
import { Tooltip } from 'src/components/layout/Tooltip';
import { Title } from 'src/components/layout/Typography';
import { userContext } from 'src/contexts/userContext';

const userTypeNames = {
    0: 'Classe',
    1: 'Admin',
    2: 'Super Admin',
};

const AdminUsers = () => {
    const [args, setArgs] = React.useState<GetUsersArgs>({
        page: 1,
        limit: 10,
    });
    const { user: currentUser } = React.useContext(userContext);
    const { users, total } = useUsers(args);
    const [deleteIndex, setDeleteIndex] = React.useState<number>(-1);
    const [inviteOpen, setInviteOpen] = React.useState<boolean>(false);

    const handleChangePage = (newPage: number) => {
        setArgs({ ...args, page: newPage });
    };
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setArgs({ ...args, page: 1, limit: parseInt(event.target.value, 10) });
    };

    const onHeaderClick = (name: 'id' | 'email' | 'pseudo' | 'school' | 'level') => () => {
        if (args.order === name) {
            setArgs({ ...args, page: 1, sort: args.sort === 'asc' ? 'desc' : 'asc' });
        } else {
            setArgs({ ...args, page: 1, sort: 'asc', order: name });
        }
    };

    const closeInviteOpen = React.useCallback(() => {
        setInviteOpen(false);
    }, []);

    return (
        <div style={{ margin: '24px 32px' }}>
            <Title>Utilisateurs</Title>
            <AdminTile
                marginY="md"
                title="Liste des utilisateurs"
                actions={
                    <Button
                        label="Inviter un utilisateur"
                        onClick={() => {
                            setInviteOpen(true);
                        }}
                        variant="contained"
                        color="light-grey"
                        leftIcon={<PlusCircledIcon style={{ width: '20px', height: '20px', marginRight: '8px' }} />}
                    />
                }
            >
                <Table aria-label="toutes les utilisateurs">
                    {users.length > 0 ? (
                        <>
                            <thead>
                                <tr>
                                    <th align="left">
                                        <Tooltip content="Trier par pseudo">
                                            <Button
                                                label="Pseudo"
                                                variant="borderless"
                                                style={{ padding: '4px', fontWeight: 600, transform: 'translateX(-4px)' }}
                                                isUpperCase={false}
                                                onClick={onHeaderClick('pseudo')}
                                                rightIcon={
                                                    args.order === 'pseudo' ? (
                                                        args.sort === 'asc' ? (
                                                            <ArrowUpIcon style={{ height: '20px', width: '20px', marginLeft: 8 }} />
                                                        ) : (
                                                            <ArrowDownIcon style={{ height: '20px', width: '20px', marginLeft: 8 }} />
                                                        )
                                                    ) : undefined
                                                }
                                            ></Button>
                                        </Tooltip>
                                    </th>
                                    <th align="left">
                                        <Tooltip content="Trier par email">
                                            <Button
                                                label="Email"
                                                variant="borderless"
                                                style={{ padding: '4px', fontWeight: 600, transform: 'translateX(-4px)' }}
                                                isUpperCase={false}
                                                onClick={onHeaderClick('email')}
                                                rightIcon={
                                                    args.order === 'email' ? (
                                                        args.sort === 'asc' ? (
                                                            <ArrowUpIcon style={{ height: '20px', width: '20px', marginLeft: 8 }} />
                                                        ) : (
                                                            <ArrowDownIcon style={{ height: '20px', width: '20px', marginLeft: 8 }} />
                                                        )
                                                    ) : undefined
                                                }
                                            ></Button>
                                        </Tooltip>
                                    </th>
                                    <th align="left">Compte</th>
                                    <th align="right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, index) => (
                                    <tr key={user.id}>
                                        <th style={{ padding: '0 16px' }}>{user.pseudo}</th>
                                        <th style={{ padding: '0 16px' }}>{user.email}</th>
                                        <th style={{ padding: '0 16px' }}>
                                            <span
                                                style={{
                                                    height: '24px',
                                                    color: 'rgba(0, 0, 0, 0.87)',
                                                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                                                    borderRadius: '16px',
                                                    padding: '0 8px',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                {userTypeNames[user.type]}
                                            </span>
                                        </th>
                                        <th align="right" style={{ minWidth: '96px' }}>
                                            <Tooltip content="Modifier">
                                                <span>
                                                    <Link href={`/admin/users/edit/${user.id}`} passHref legacyBehavior>
                                                        <IconButton
                                                            as="a"
                                                            margin="xs"
                                                            marginRight={currentUser === null || user.id === currentUser.id ? 'sm' : undefined}
                                                            aria-label="edit"
                                                            variant="borderless"
                                                            icon={Pencil1Icon}
                                                        ></IconButton>
                                                    </Link>
                                                </span>
                                            </Tooltip>
                                            {currentUser !== null && user.id !== currentUser.id && (
                                                <Tooltip content="Supprimer">
                                                    <IconButton
                                                        marginY="xs"
                                                        marginRight="sm"
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
                                            value={args.limit || 10}
                                            onChange={handleChangeRowsPerPage}
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
                                            {((args.page || 1) - 1) * (args.limit || 10) + 1}-{Math.min(total, (args.page || 1) * (args.limit || 10))}{' '}
                                            sur {total}
                                        </span>
                                        <IconButton
                                            marginY="xs"
                                            marginLeft="sm"
                                            aria-label="previous"
                                            onClick={() => {
                                                handleChangePage((args.page || 1) - 1);
                                            }}
                                            variant="borderless"
                                            disabled={(args.page || 1) === 1}
                                            icon={ChevronLeftIcon}
                                        ></IconButton>
                                        <IconButton
                                            marginY="xs"
                                            marginRight="sm"
                                            aria-label="next"
                                            onClick={() => {
                                                handleChangePage((args.page || 1) + 1);
                                            }}
                                            disabled={(args.page || 1) * (args.limit || 10) >= total}
                                            variant="borderless"
                                            icon={ChevronRightIcon}
                                        ></IconButton>
                                    </th>
                                </tr>
                            </tbody>
                        </>
                    ) : (
                        <tbody>
                            <tr>
                                <th colSpan={4} align="center">
                                    Cette liste est vide !
                                </th>
                            </tr>
                        </tbody>
                    )}
                </Table>
            </AdminTile>
            <InviteUserModal open={inviteOpen} onClose={closeInviteOpen} />
            <DeleteUserModal
                user={deleteIndex === -1 ? null : users[deleteIndex] || null}
                onClose={() => {
                    setDeleteIndex(-1);
                }}
            />
        </div>
    );
};

export default AdminUsers;
