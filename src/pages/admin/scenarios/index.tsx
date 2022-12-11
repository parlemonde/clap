import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React from 'react';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HelpIcon from '@mui/icons-material/Help';
import { Link as MuiLink } from '@mui/material';
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

import { useLanguages } from 'src/api/languages/languages.list';
import { useDeleteScenarioMutation } from 'src/api/scenarios/scenarios.delete';
import { useScenarios } from 'src/api/scenarios/scenarios.list';
import { useUpdateScenarioMutation } from 'src/api/scenarios/scenarios.put';
import { useThemes } from 'src/api/themes/themes.list';
import { AdminTile } from 'src/components/admin/AdminTile';
import Modal from 'src/components/ui/Modal';
import type { Scenario } from 'types/models/scenario.type';

type ScenarioData = {
    themeIndex: number;
    startIndex: number;
    scenarios: Scenario[];
};

const AdminScenarios = () => {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();

    const { languages } = useLanguages();
    const { themes } = useThemes({ isDefault: true });
    const { scenarios } = useScenarios({ isDefault: true });
    const { scenarios: userScenarios } = useScenarios({ isDefault: false });

    const [deleteId, setDeleteId] = React.useState<number | null>(null);
    const [selectedLanguage, setSelectedLanguage] = React.useState<string>('fr');

    const scenariosData = React.useMemo(() => {
        const data: ScenarioData[] = [];
        let currentStartIndex = 0;
        for (let themeIndex = 0; themeIndex < themes.length; themeIndex++) {
            const themeScenarios = scenarios.filter((s) => s.themeId === themes[themeIndex].id);
            data.push({
                themeIndex: themeIndex,
                startIndex: currentStartIndex,
                scenarios: themeScenarios,
            });
            currentStartIndex += themeScenarios.length;
        }
        return data;
    }, [themes, scenarios]);

    const userScenariosData = React.useMemo(() => {
        const data: ScenarioData[] = [];
        let currentStartIndex = 0;
        for (let themeIndex = 0; themeIndex < themes.length; themeIndex++) {
            const themeScenarios = userScenarios.filter((s) => s.names[selectedLanguage] !== undefined && s.themeId === themes[themeIndex].id);
            if (themeScenarios.length > 0) {
                data.push({
                    themeIndex: themeIndex,
                    startIndex: currentStartIndex,
                    scenarios: themeScenarios,
                });
            }
            currentStartIndex += themeScenarios.length;
        }
        const themeIdsSet = new Set(themes.map((t) => t.id));
        const otherUserScenarios = userScenarios.filter((s) => s.names[selectedLanguage] !== undefined && !themeIdsSet.has(s.themeId));
        if (otherUserScenarios.length > 0) {
            data.push({
                themeIndex: -1,
                startIndex: currentStartIndex,
                scenarios: otherUserScenarios,
            });
        }
        return data;
    }, [themes, userScenarios, selectedLanguage]);

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

    const deleteScenarioMutation = useDeleteScenarioMutation();
    const onDeleteScenario = async () => {
        if (deleteId === null) {
            return;
        }
        try {
            await deleteScenarioMutation.mutateAsync({
                scenarioId: deleteId,
            });
            enqueueSnackbar('Scénario supprimé avec succès!', {
                variant: 'success',
            });
        } catch (err) {
            console.error(err);
            enqueueSnackbar('Une erreur inconnue est survenue...', {
                variant: 'error',
            });
        }
        setDeleteId(null);
    };

    const updateScenarioMutation = useUpdateScenarioMutation();
    const validateScenario = async (scenarioId: number | string) => {
        if (typeof scenarioId === 'string') {
            return;
        }
        try {
            await updateScenarioMutation.mutateAsync({
                scenarioId,
                isDefault: true,
            });
            enqueueSnackbar('Scénario validé avec succès!', {
                variant: 'success',
            });
        } catch (err) {
            console.error(err);
            enqueueSnackbar('Une erreur inconnue est survenue...', {
                variant: 'error',
            });
        }
    };

    const toDeleteScenarioName = React.useMemo(() => {
        const names = deleteId ? scenarios.find((s) => s.id === deleteId)?.names ?? null : null;
        if (names === null || Object.keys(names).length === 0) {
            return '';
        }
        return names[selectedLanguage] || names[Object.keys(names)[0]];
    }, [deleteId, scenarios, selectedLanguage]);

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
                                        {scenariosData.map((data) => (
                                            <React.Fragment key={`top_${data.themeIndex}`}>
                                                <TableRow key={data.themeIndex}>
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
                                                        {themes[data.themeIndex].names[selectedLanguage] || themes[data.themeIndex].names.fr || ''}
                                                    </TableCell>
                                                </TableRow>
                                                {data.scenarios.length > 0 ? (
                                                    data.scenarios.map((s, index) => (
                                                        <TableRow
                                                            key={`${data.themeIndex}_${s.id}`}
                                                            sx={
                                                                index % 2 === 0
                                                                    ? { backgroundColor: 'white' }
                                                                    : { backgroundColor: 'rgb(224 239 232)' }
                                                            }
                                                        >
                                                            <TableCell style={{ width: '3rem' }}>{index + data.startIndex + 1}</TableCell>
                                                            <TableCell style={{ color: s.names[selectedLanguage] ? 'inherit' : 'grey' }}>
                                                                {s.names[selectedLanguage] ||
                                                                    `${s.names.fr || s.names[Object.keys(s.names)[0]]} (non traduit)`}
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
                                                                            if (typeof s.id === 'number') {
                                                                                setDeleteId(s.id);
                                                                            }
                                                                        }}
                                                                    >
                                                                        <DeleteIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow sx={{ backgroundColor: 'white' }} key={`${data.themeIndex}_no_data`}>
                                                        <TableCell colSpan={4} align="center" style={{ padding: '4px' }}>
                                                            {`Ce thème n'a pas de scénario ! `}
                                                            <Link href={`/admin/scenarios/new?themeId=${themes[data.themeIndex].id}`} passHref>
                                                                <MuiLink>Ajouter un scénario ?</MuiLink>
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
                                            <Link href="/admin/themes/new" passHref>
                                                <MuiLink color="secondary">Ajouter un thème ?</MuiLink>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            )}
                        </Table>
                    </TableContainer>
                </AdminTile>
                <Modal
                    isOpen={deleteId !== null}
                    onClose={() => {
                        setDeleteId(null);
                    }}
                    onConfirm={onDeleteScenario}
                    isLoading={deleteScenarioMutation.isLoading}
                    confirmLabel="Supprimer"
                    confirmLevel="error"
                    cancelLabel="Annuler"
                    title="Supprimer le scénario ?"
                    ariaLabelledBy="delete-dialog-title"
                    ariaDescribedBy="delete-dialog-description"
                    isFullWidth
                >
                    <DialogContentText id="delete-dialog-description">
                        Voulez-vous vraiment supprimer le scénario <strong>{toDeleteScenarioName}</strong> ?
                    </DialogContentText>
                </Modal>

                {userScenariosData.length > 0 && (
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
                                    {userScenariosData.map((data) => (
                                        <React.Fragment key={`user_top_${data.themeIndex}`}>
                                            <TableRow key={data.themeIndex}>
                                                <TableCell
                                                    colSpan={4}
                                                    sx={{
                                                        padding: '4px 16px',
                                                        backgroundColor: (theme) => theme.palette.secondary.dark,
                                                        borderBottom: 'none',
                                                        color: 'white',
                                                    }}
                                                >
                                                    {data.themeIndex === -1
                                                        ? 'Autres thèmes (créés par les utilisateurs)'
                                                        : `Thème : ${
                                                              themes[data.themeIndex].names[selectedLanguage] ||
                                                              themes[data.themeIndex].names.fr ||
                                                              ''
                                                          }`}
                                                </TableCell>
                                            </TableRow>
                                            {data.scenarios.map((s, index) => (
                                                <TableRow
                                                    key={`${data.themeIndex}_${s.id}`}
                                                    sx={index % 2 === 0 ? { backgroundColor: 'white' } : { backgroundColor: 'rgb(224 239 232)' }}
                                                >
                                                    <TableCell style={{ width: '3rem' }}>{index + data.startIndex + 1}</TableCell>
                                                    <TableCell style={{ color: s.names[selectedLanguage] ? 'inherit' : 'grey' }}>
                                                        {s.names[selectedLanguage] || `${s.names.default} (non traduit)`}
                                                    </TableCell>
                                                    <TableCell style={{ color: s.descriptions[selectedLanguage] ? 'inherit' : 'grey' }}>
                                                        {s.descriptions[selectedLanguage] || s.descriptions.default}
                                                    </TableCell>
                                                    <TableCell align="right" padding="none" style={{ minWidth: '96px' }}>
                                                        {data.themeIndex !== -1 && (
                                                            <Tooltip title="Valider le scénario">
                                                                <IconButton
                                                                    aria-label="valider"
                                                                    onClick={() => {
                                                                        validateScenario(s.id).catch();
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
