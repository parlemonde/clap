import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useQueryClient } from 'react-query';
import { ReactSortable } from 'react-sortablejs';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import { Link } from '@mui/material';
import Button from '@mui/material/Button';
import DialogContentText from '@mui/material/DialogContentText';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import NoSsr from '@mui/material/NoSsr';
import type { SelectChangeEvent } from '@mui/material/Select';
import Select from '@mui/material/Select';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { Modal } from 'src/components/Modal';
import { AdminTile } from 'src/components/admin/AdminTile';
import { UserServiceContext } from 'src/services/UserService';
import { useLanguages } from 'src/services/useLanguages';
import { useThemes } from 'src/services/useThemes';
import type { Theme } from 'types/models/theme.type';

const AdminThemes: React.FunctionComponent = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();
    const { axiosLoggedRequest } = React.useContext(UserServiceContext);
    const { languages } = useLanguages();
    const { themes: defaultThemes, setThemes: setDefaultThemes } = useThemes({ isDefault: true });
    const { themes: userThemes, setThemes: setUserThemes } = useThemes({ isDefault: false });
    const [deleteIndex, setDeleteIndex] = React.useState<number | null>(null);
    const [selectedLanguage, setSelectedLanguage] = React.useState<string>('fr');

    const validateTheme = (themeId: number | string, themeIndex: number) => async () => {
        const response = await axiosLoggedRequest({
            method: 'PUT',
            url: `/themes/${themeId}`,
            data: {
                isDefault: true,
                order: defaultThemes.length + userThemes.length + 1,
            },
        });
        if (response.error) {
            return;
        }
        const newUserThemes = [...userThemes];
        const theme = newUserThemes.splice(themeIndex, 1)[0];
        setUserThemes(newUserThemes);
        setDefaultThemes([...defaultThemes, theme]);
    };

    const setThemesOrder = async (themes: Theme[]) => {
        if (themes.map((t) => t.id).join(',') === defaultThemes.map((t) => t.id).join(',')) {
            return;
        }
        setDefaultThemes(themes);
        const order = themes.map((t) => t.id);
        try {
            const response = await axiosLoggedRequest({
                method: 'PUT',
                url: '/themes/update-order',
                data: {
                    order,
                },
            });
            if (response.error) {
                enqueueSnackbar('Une erreur inconnue est survenue...', {
                    variant: 'error',
                });
                queryClient.invalidateQueries('themes');
                console.error(response.error);
            }
        } catch (e) {
            enqueueSnackbar('Une erreur inconnue est survenue...', {
                variant: 'error',
            });
            queryClient.invalidateQueries('themes');
            console.error(e);
        }
    };

    const goToPath = (path: string) => (event: React.MouseEvent) => {
        event.preventDefault();
        router.push(path);
    };

    const onDeleteTheme = async () => {
        if (deleteIndex === null) {
            return;
        }
        const response = await axiosLoggedRequest({
            method: 'DELETE',
            url: `/themes/${defaultThemes[deleteIndex].id}`,
        });
        if (response.error) {
            enqueueSnackbar('Une erreur inconnue est survenue...', {
                variant: 'error',
            });
            console.error(response.error);
            return;
        }
        enqueueSnackbar('Thème supprimé avec succès!', {
            variant: 'success',
        });
        const themes = [...defaultThemes];
        themes.splice(deleteIndex, 1);
        setDefaultThemes(themes);
        setDeleteIndex(null);
    };

    const onLanguageChange = (event: SelectChangeEvent<string>) => {
        setSelectedLanguage(event.target.value);
    };

    return (
        <div style={{ paddingBottom: '2rem' }}>
            <Typography variant="h1" color="primary">
                Thèmes
            </Typography>
            <NoSsr>
                <AdminTile
                    title="Liste des thèmes"
                    toolbarButton={
                        <Button
                            color="inherit"
                            sx={{ color: 'black' }}
                            component="a"
                            href="/admin/themes/new"
                            onClick={goToPath('/admin/themes/new')}
                            style={{ flexShrink: 0 }}
                            variant="contained"
                            startIcon={<AddCircleIcon />}
                        >
                            Ajouter un thème
                        </Button>
                    }
                >
                    <TableContainer>
                        <Table aria-labelledby="themetabletitle" size="medium" aria-label="tout les thèmes">
                            {defaultThemes.length > 0 ? (
                                <>
                                    <TableHead
                                        style={{ borderBottom: '1px solid white' }}
                                        sx={{
                                            backgroundColor: (theme) => theme.palette.secondary.main,
                                            color: 'white',
                                            fontWeight: 'bold',
                                            minHeight: 'unset',
                                            padding: '8px 8px 8px 16px',
                                        }}
                                    >
                                        <TableRow>
                                            <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Ordre</TableCell>
                                            <TableCell style={{ color: 'white', fontWeight: 'bold' }}>
                                                Nom{' '}
                                                <span style={{ marginLeft: '2rem' }}>
                                                    (
                                                    <Select
                                                        variant="standard"
                                                        value={selectedLanguage}
                                                        color="secondary"
                                                        style={{ color: 'white' }}
                                                        onChange={onLanguageChange}
                                                    >
                                                        {languages.map((l) => (
                                                            <MenuItem key={l.value} value={l.value}>
                                                                {l.label.toLowerCase()}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </span>
                                                )
                                            </TableCell>
                                            <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Image</TableCell>
                                            <TableCell style={{ color: 'white', fontWeight: 'bold' }} align="right">
                                                Actions
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <ReactSortable tag={'tbody'} list={defaultThemes} setList={setThemesOrder} animation={100} handle=".theme-index">
                                        {defaultThemes.map((t, index) => (
                                            <TableRow
                                                sx={{
                                                    backgroundColor: 'white',
                                                    '&:nth-of-type(even)': {
                                                        backgroundColor: 'rgb(224 239 232)',
                                                    },
                                                    '&.sortable-ghost': {
                                                        opacity: 0,
                                                    },
                                                }}
                                                key={t.id}
                                            >
                                                <TableCell padding="none" className="theme-index">
                                                    <div style={{ display: 'flex', alignItems: 'center', cursor: 'grab', marginLeft: '8px' }}>
                                                        <DragIndicatorIcon />
                                                        {index}
                                                    </div>
                                                </TableCell>
                                                <TableCell style={{ color: t.names[selectedLanguage] ? 'inherit' : 'grey' }}>
                                                    {t.names[selectedLanguage] || `${t.names.fr} (non traduit)`}
                                                </TableCell>
                                                <TableCell style={{ padding: '0 16px' }} padding="none">
                                                    {t.image ? (
                                                        <img style={{ display: 'table-cell' }} height="40" src={t.image.path} />
                                                    ) : (
                                                        'Aucune image'
                                                    )}
                                                </TableCell>
                                                <TableCell align="right" padding="none" style={{ minWidth: '96px' }}>
                                                    <Tooltip title="Modifier">
                                                        <IconButton aria-label="edit" onClick={goToPath(`/admin/themes/edit/${t.id}`)}>
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Supprimer">
                                                        <IconButton
                                                            aria-label="delete"
                                                            onClick={() => {
                                                                setDeleteIndex(index);
                                                            }}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </ReactSortable>
                                </>
                            ) : (
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            Cette liste est vide !{' '}
                                            <Link href="/admin/themes/new" onClick={goToPath('/admin/themes/new')} color="secondary">
                                                Ajouter un thème ?
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            )}
                        </Table>
                    </TableContainer>
                </AdminTile>
                <Modal
                    open={deleteIndex !== null}
                    onClose={() => {
                        setDeleteIndex(null);
                    }}
                    onConfirm={onDeleteTheme}
                    confirmLabel="Supprimer"
                    cancelLabel="Annuler"
                    title="Supprimer le thème ?"
                    error={true}
                    ariaLabelledBy="delete-dialog-title"
                    ariaDescribedBy="delete-dialog-description"
                    fullWidth
                >
                    <DialogContentText id="delete-dialog-description">
                        Voulez-vous vraiment supprimer le thème <strong>{deleteIndex !== null && defaultThemes[deleteIndex].names.fr}</strong> ?
                    </DialogContentText>
                </Modal>

                {userThemes.length > 0 && (
                    <AdminTile title="Thèmes des utilisateurs" style={{ marginTop: '2rem' }}>
                        <TableContainer>
                            <Table aria-labelledby="themetabletitle" size="medium" aria-label="tout les thèmes">
                                <TableHead
                                    style={{ borderBottom: '1px solid white' }}
                                    sx={{
                                        backgroundColor: (theme) => theme.palette.secondary.main,
                                        color: 'white',
                                        fontWeight: 'bold',
                                        minHeight: 'unset',
                                        padding: '8px 8px 8px 16px',
                                    }}
                                >
                                    <TableRow>
                                        <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Nom</TableCell>
                                        <TableCell style={{ color: 'white', fontWeight: 'bold' }} align="right">
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {userThemes.map((t, index) => (
                                        <TableRow
                                            sx={{
                                                backgroundColor: 'white',
                                                '&:nth-of-type(even)': {
                                                    backgroundColor: 'rgb(224 239 232)',
                                                },
                                                '&.sortable-ghost': {
                                                    opacity: 0,
                                                },
                                            }}
                                            key={t.id}
                                        >
                                            <TableCell>{t.names.fr}</TableCell>
                                            <TableCell align="right" padding="none">
                                                <Tooltip title="Valider le thème">
                                                    <IconButton aria-label="valider" onClick={validateTheme(t.id, index)}>
                                                        <CheckIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </AdminTile>
                )}
            </NoSsr>
        </div>
    );
};

export default AdminThemes;
