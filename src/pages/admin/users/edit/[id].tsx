import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React from 'react';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import NoSsr from '@mui/material/NoSsr';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useUser } from 'src/api/users/users.get';
import { useUpdateUserMutation } from 'src/api/users/users.put';
import { AdminTile } from 'src/components/admin/AdminTile';
import { Loader } from 'src/components/layout/Loader';
import Modal from 'src/components/ui/Modal';
import { getQueryString } from 'src/utils/get-query-string';
import type { User } from 'types/models/user.type';

const AdminEditUser = () => {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();

    const userId = React.useMemo(() => Number(getQueryString(router.query.id)) || 0, [router]);
    const { user: fetchedUser } = useUser(userId, { enabled: userId !== 0 });

    const [user, setUser] = React.useState<User | null>(fetchedUser || null);
    const [isBlocked, setIsBlocked] = React.useState<boolean>(true);
    const [isBlockedModalOpen, setIsBlockedModalOpen] = React.useState<boolean>(false);

    React.useEffect(() => {
        setUser(fetchedUser || null);
    }, [fetchedUser]);

    const goToPath = (path: string) => (event: React.MouseEvent) => {
        event.preventDefault();
        router.push(path);
    };

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
            enqueueSnackbar('Utilisateur modifié avec succès!', {
                variant: 'success',
            });
            router.push('/admin/users');
        } catch (err) {
            console.error(err);
            enqueueSnackbar('Une erreur est survenue...', {
                variant: 'error',
            });
        }
    };

    return (
        <div style={{ paddingBottom: '2rem' }}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="large" color="primary" />} aria-label="breadcrumb">
                <Link href="/admin/users" onClick={goToPath('/admin/users')}>
                    <Typography variant="h1" color="primary">
                        Utilisateurs
                    </Typography>
                </Link>
                <Typography variant="h1" color="textPrimary">
                    {user?.pseudo || ''}
                </Typography>
            </Breadcrumbs>
            <NoSsr>
                {user !== null && (
                    <AdminTile title="Informations">
                        <div style={{ padding: '1rem' }}>
                            <Typography variant="h3">Identifiants de connexion</Typography>
                            <div style={{ margin: '0.5rem 0 2rem 0' }}>
                                <TextField
                                    variant="standard"
                                    label="Pseudo"
                                    value={user.pseudo || ''}
                                    color="secondary"
                                    fullWidth
                                    disabled={isBlocked}
                                    onChange={onChangeValue('pseudo')}
                                />
                                <TextField
                                    variant="standard"
                                    style={{ marginTop: '0.5rem' }}
                                    label="Email"
                                    value={user.email || ''}
                                    color="secondary"
                                    fullWidth
                                    disabled={isBlocked}
                                    onChange={onChangeValue('email')}
                                />
                                {isBlocked && (
                                    <Button
                                        style={{ marginTop: '0.8rem' }}
                                        onClick={() => {
                                            setIsBlockedModalOpen(true);
                                        }}
                                        variant="contained"
                                        color="secondary"
                                        size="small"
                                    >
                                        Changer les identifiants
                                    </Button>
                                )}
                            </div>
                            <Typography variant="h3">Type de compte</Typography>
                            <div style={{ margin: '0.5rem 0 2rem 0' }}>
                                <FormControl component="fieldset">
                                    <RadioGroup aria-label="type de compte" name="type" value={user.type} onChange={onChangeValue('type')}>
                                        <FormControlLabel value={0} control={<Radio size="small" />} label="Compte classe" />
                                        <FormControlLabel value={1} control={<Radio size="small" />} label="Compte administrateur" />
                                        <FormControlLabel value={2} control={<Radio size="small" />} label="Super administrateur" />
                                    </RadioGroup>
                                </FormControl>
                            </div>
                            <div style={{ width: '100%', textAlign: 'center' }}>
                                <Button variant="contained" color="secondary" onClick={submit}>
                                    Modifier
                                </Button>
                            </div>
                        </div>
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
                            ariaLabelledBy="up-dialog-title"
                            ariaDescribedBy="up-dialog-description"
                            isFullWidth
                        >
                            <div>Attention, les identifiants sont nécessaires à la connection ! Êtes vous sur de vouloir les changer ?</div>
                        </Modal>
                    </AdminTile>
                )}
            </NoSsr>
            <Button variant="outlined" style={{ marginTop: '1rem' }} onClick={goToPath('/admin/users')}>
                Retour
            </Button>
            <Loader isLoading={isLoading} />
        </div>
    );
};

export default AdminEditUser;
