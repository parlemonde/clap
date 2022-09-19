import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useQueryClient } from 'react-query';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HelpIcon from '@mui/icons-material/Help';
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
import { useScenarios } from 'src/services/useScenarios';
import { useThemeNames } from 'src/services/useThemes';
import type { GroupedScenario } from 'src/util/groupScenarios';
import { groupScenarios } from 'src/util/groupScenarios';

interface ScenarioData {
    id: number;
    startIndex: number;
    // theme: string;
    scenarios: GroupedScenario[];
}

const AdminScenarios: React.FunctionComponent = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();
    const { languages } = useLanguages();
    const { themeNames } = useThemeNames();
    const { axiosLoggedRequest } = React.useContext(UserServiceContext);
    const { scenarios } = useScenarios({ isDefault: true });
    const { scenarios: userScenarios } = useScenarios({ isDefault: false });
    const [deleteId, setDeleteId] = React.useState<number | null>(null);
    const [selectedLanguage, setSelectedLanguage] = React.useState<string>('fr');

    // get scenario per themes
    const scenariosData: ScenarioData[] = React.useMemo(() => {
        const data = Object.keys(themeNames).map((id) => ({
            id: parseInt(id, 10),
            startIndex: 0,
            scenarios: groupScenarios(scenarios).filter((scenario) => scenario.themeId === parseInt(id, 10)),
        }));
        for (let i = 1, n = data.length; i < n; i++) {
            data[i].startIndex = data[i - 1].startIndex + data[i - 1].scenarios.length;
        }
        return data;
    }, [themeNames, scenarios]);

    // get scenario per themes for users
    const userScenariosData: ScenarioData[] = React.useMemo(() => {
        const themeIds = Object.keys(themeNames);
        const data = themeIds.map((id) => ({
            id: parseInt(id, 10),
            startIndex: 0,
            scenarios: groupScenarios(userScenarios).filter((scenario) => scenario.themeId === parseInt(id, 10)),
        }));
        data.push({
            id: -1,
            startIndex: 0,
            scenarios: groupScenarios(userScenarios).filter((scenario) => !themeIds.includes(`${scenario.themeId}`)),
        });
        for (let i = 1, n = data.length; i < n; i++) {
            data[i].startIndex = data[i - 1].startIndex + data[i - 1].scenarios.length;
        }
        return data.filter((d) => d.scenarios.length > 0);
    }, [themeNames, userScenarios]);

    const goToPath = (path: string) => (event: React.MouseEvent) => {
        event.preventDefault();
        router.push(path);
    };

    const onLanguageChange = (event: SelectChangeEvent<string>) => {
        setSelectedLanguage(event.target.value);
    };

    const selectLanguage = (
        <span style={{ marginLeft: '2rem' }}>
            (
            <Select variant="standard" value={selectedLanguage} color="secondary" style={{ color: 'white' }} onChange={onLanguageChange}>
                {languages.map((l) => (
                    <MenuItem key={l.value} value={l.value}>
                        {l.label.toLowerCase()}
                    </MenuItem>
                ))}
            </Select>
            )
        </span>
    );

    const helpIcon = (
        <Tooltip
            sx={{
                '& .MuiTooltip-tooltip': {
                    backgroundColor: 'white',
                    color: 'rgba(0, 0, 0, 0.87)',
                    border: '1px solid grey',
                },
            }}
            title={
                <Typography color="inherit" variant="caption">
                    {
                        "Un scénario non traduit ne sera pas affiché. Il n'est donc pas nécessaire de le traduire si le scénario n'est que pour une langue spécifique."
                    }
                </Typography>
            }
            style={{ cursor: 'pointer' }}
        >
            <HelpIcon fontSize="inherit" />
        </Tooltip>
    );

    const onDeleteScenario = async () => {
        if (deleteId === null) {
            return;
        }
        const response = await axiosLoggedRequest({
            method: 'DELETE',
            url: `/scenarios/${deleteId}`,
        });
        if (response.error) {
            enqueueSnackbar('Une erreur inconnue est survenue...', {
                variant: 'error',
            });
            console.error(response.error);
            return;
        }
        enqueueSnackbar('Scénario supprimé avec succès!', {
            variant: 'success',
        });
        setDeleteId(null);
        queryClient.invalidateQueries('scenarios');
    };

    const validateScenario = async (scenarioId: number | string, languageCode: string) => {
        const response = await axiosLoggedRequest({
            method: 'PUT',
            url: `/scenarios/${scenarioId}_${languageCode}`,
            data: {
                isDefault: true,
            },
        });
        if (response.error) {
            return;
        }
        queryClient.invalidateQueries('scenarios');
    };

    const toDeleteScenarioName = deleteId === null ? '' : groupScenarios(scenarios).find((s) => s.id === deleteId)?.names.default || '';

    return (
        <div style={{ paddingBottom: '2rem' }}>
            <Typography variant="h1" color="primary">
                Scénarios
            </Typography>
            <NoSsr>
                <AdminTile
                    title="Liste des scénarios par thème"
                    selectLanguage={selectLanguage}
                    toolbarButton={
                        scenariosData.length > 0 ? (
                            <Button
                                color="inherit"
                                sx={{ color: 'black' }}
                                component="a"
                                href="/admin/scenarios/new"
                                onClick={goToPath('/admin/scenarios/new')}
                                style={{ flexShrink: 0 }}
                                variant="contained"
                                startIcon={<AddCircleIcon />}
                            >
                                Ajouter un scénario
                            </Button>
                        ) : null
                    }
                >
                    <TableContainer>
                        <Table aria-labelledby="themetabletitle" size="medium" aria-label="tout les scénarios">
                            {scenariosData.length > 0 ? (
                                <>
                                    <TableHead
                                        style={{ borderBottom: 'none' }}
                                        sx={{
                                            backgroundColor: (theme) => theme.palette.secondary.main,
                                            color: 'white',
                                            fontWeight: 'bold',
                                            minHeight: 'unset',
                                            padding: '8px 8px 8px 16px',
                                        }}
                                    >
                                        <TableRow>
                                            <TableCell style={{ color: 'white', fontWeight: 'bold', border: 'none' }}>#</TableCell>
                                            <TableCell style={{ color: 'white', fontWeight: 'bold', border: 'none' }}>Nom</TableCell>
                                            <TableCell style={{ color: 'white', fontWeight: 'bold', border: 'none' }}>Description</TableCell>
                                            <TableCell style={{ color: 'white', fontWeight: 'bold', border: 'none' }} align="right">
                                                Actions
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {scenariosData.map((theme) => (
                                            <React.Fragment key={`top_${theme.id}`}>
                                                <TableRow key={theme.id}>
                                                    <TableCell
                                                        colSpan={4}
                                                        sx={{
                                                            padding: '4px 16px',
                                                            backgroundColor: (theme) => theme.palette.secondary.dark,
                                                            borderBottom: 'none',
                                                            color: 'white',
                                                        }}
                                                    >
                                                        Thème :{' '}
                                                        {themeNames[theme.id]
                                                            ? themeNames[theme.id][selectedLanguage] || themeNames[theme.id].fr || ''
                                                            : `numéro ${theme.id}`}
                                                    </TableCell>
                                                </TableRow>
                                                {theme.scenarios.length > 0 ? (
                                                    theme.scenarios.map((s, index) => (
                                                        <TableRow
                                                            key={`${theme.id}_${s.id}`}
                                                            sx={
                                                                index % 2 === 0
                                                                    ? { backgroundColor: 'white' }
                                                                    : { backgroundColor: 'rgb(224 239 232)' }
                                                            }
                                                        >
                                                            <TableCell style={{ width: '3rem' }}>{index + theme.startIndex + 1}</TableCell>
                                                            <TableCell style={{ color: s.names[selectedLanguage] ? 'inherit' : 'grey' }}>
                                                                {s.names[selectedLanguage] || `${s.names.default} (non traduit)`}
                                                                {!s.names[selectedLanguage] && helpIcon}
                                                            </TableCell>
                                                            <TableCell style={{ color: s.descriptions[selectedLanguage] ? 'inherit' : 'grey' }}>
                                                                {s.descriptions[selectedLanguage] || s.descriptions.default}
                                                            </TableCell>
                                                            <TableCell align="right" padding="none" style={{ minWidth: '96px' }}>
                                                                <Tooltip title="Modifier">
                                                                    <IconButton aria-label="edit" onClick={goToPath(`/admin/scenarios/edit/${s.id}`)}>
                                                                        <EditIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Supprimer">
                                                                    <IconButton
                                                                        aria-label="delete"
                                                                        onClick={() => {
                                                                            setDeleteId(s.id);
                                                                        }}
                                                                    >
                                                                        <DeleteIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow sx={{ backgroundColor: 'white' }} key={`${theme.id}_no_data`}>
                                                        <TableCell colSpan={4} align="center" style={{ padding: '4px' }}>
                                                            {`Ce thème n'a pas de scénario ! `}
                                                            <Link
                                                                href={`/admin/scenarios/new?themeId=${theme.id}`}
                                                                onClick={goToPath(`/admin/scenarios/new?themeId=${theme.id}`)}
                                                            >
                                                                Ajouter un scénario ?
                                                            </Link>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </TableBody>
                                </>
                            ) : (
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            {"Vous n'avez pas de thème ! "}
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
                    open={deleteId !== null}
                    onClose={() => {
                        setDeleteId(null);
                    }}
                    onConfirm={onDeleteScenario}
                    confirmLabel="Supprimer"
                    cancelLabel="Annuler"
                    title="Supprimer le scénario ?"
                    error={true}
                    ariaLabelledBy="delete-dialog-title"
                    ariaDescribedBy="delete-dialog-description"
                    fullWidth
                >
                    <DialogContentText id="delete-dialog-description">
                        Voulez-vous vraiment supprimer le scénario <strong>{toDeleteScenarioName}</strong> ?
                    </DialogContentText>
                </Modal>

                {userScenarios.length > 0 && (
                    <AdminTile title="Scénarios des utilisateurs" selectLanguage={selectLanguage} style={{ marginTop: '2rem' }}>
                        <TableContainer>
                            <Table aria-labelledby="themetabletitle" size="medium" aria-label="Scénarios des utilisateurs">
                                <TableHead
                                    style={{ borderBottom: 'none' }}
                                    sx={{
                                        backgroundColor: (theme) => theme.palette.secondary.main,
                                        color: 'white',
                                        fontWeight: 'bold',
                                        minHeight: 'unset',
                                        padding: '8px 8px 8px 16px',
                                    }}
                                >
                                    <TableRow>
                                        <TableCell style={{ color: 'white', fontWeight: 'bold', border: 'none' }}>#</TableCell>
                                        <TableCell style={{ color: 'white', fontWeight: 'bold', border: 'none' }}>Nom</TableCell>
                                        <TableCell style={{ color: 'white', fontWeight: 'bold', border: 'none' }}>Description</TableCell>
                                        <TableCell style={{ color: 'white', fontWeight: 'bold', border: 'none' }} align="right">
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {userScenariosData.map((theme) => (
                                        <React.Fragment key={`user_top_${theme.id}`}>
                                            <TableRow key={theme.id}>
                                                <TableCell
                                                    colSpan={4}
                                                    sx={{
                                                        padding: '4px 16px',
                                                        backgroundColor: (theme) => theme.palette.secondary.dark,
                                                        borderBottom: 'none',
                                                        color: 'white',
                                                    }}
                                                >
                                                    {theme.id === -1
                                                        ? 'Autres thèmes (créés par les utilisateurs)'
                                                        : `Thème : ${
                                                              themeNames[theme.id]
                                                                  ? themeNames[theme.id][selectedLanguage] || themeNames[theme.id].fr || ''
                                                                  : `numéro ${theme.id}`
                                                          }`}
                                                </TableCell>
                                            </TableRow>
                                            {theme.scenarios.map((s, index) => (
                                                <TableRow
                                                    key={`${theme.id}_${s.id}`}
                                                    sx={index % 2 === 0 ? { backgroundColor: 'white' } : { backgroundColor: 'rgb(224 239 232)' }}
                                                >
                                                    <TableCell style={{ width: '3rem' }}>{index + theme.startIndex + 1}</TableCell>
                                                    <TableCell style={{ color: s.names[selectedLanguage] ? 'inherit' : 'grey' }}>
                                                        {s.names[selectedLanguage] || `${s.names.default} (non traduit)`}
                                                    </TableCell>
                                                    <TableCell style={{ color: s.descriptions[selectedLanguage] ? 'inherit' : 'grey' }}>
                                                        {s.descriptions[selectedLanguage] || s.descriptions.default}
                                                    </TableCell>
                                                    <TableCell align="right" padding="none" style={{ minWidth: '96px' }}>
                                                        {theme.id !== -1 && (
                                                            <Tooltip title="Valider le scénario">
                                                                <IconButton
                                                                    aria-label="valider"
                                                                    onClick={() => {
                                                                        validateScenario(
                                                                            s.id,
                                                                            Object.keys(s.names).filter((id) => id !== 'default')[0],
                                                                        ).catch();
                                                                    }}
                                                                >
                                                                    <CheckIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </React.Fragment>
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

export default AdminScenarios;
