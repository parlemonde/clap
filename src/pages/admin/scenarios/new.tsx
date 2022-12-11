import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React from 'react';

import Close from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import type { SelectChangeEvent } from '@mui/material/Select';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useLanguages } from 'src/api/languages/languages.list';
import { useCreateScenarioMutation } from 'src/api/scenarios/scenarios.post';
import { useThemes } from 'src/api/themes/themes.list';
import { AdminTile } from 'src/components/admin/AdminTile';
import { Loader } from 'src/components/layout/Loader';
import Modal from 'src/components/ui/Modal';
import { useQueryNumber } from 'src/utils/useQueryId';
import type { Language } from 'types/models/language.type';
import type { Scenario } from 'types/models/scenario.type';

const AdminNewScenario = () => {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();

    const queryThemeId = useQueryNumber('themeId');
    const { themes } = useThemes({ isDefault: true });
    const { languages } = useLanguages();
    const languagesMap = React.useMemo(
        () => languages.reduce((acc: { [key: string]: number }, language: Language, index: number) => ({ ...acc, [language.value]: index }), {}),
        [languages],
    );

    const [themeId, setThemeId] = React.useState(queryThemeId || -1);
    const [scenarioNames, setScenarioNames] = React.useState<Scenario['names']>({});
    const [scenarioDescriptions, setScenarioDescriptions] = React.useState<Scenario['descriptions']>({});

    const [showModal, setShowModal] = React.useState<boolean>(false);
    const [languageToAdd, setLanguageToAdd] = React.useState<number>(0);
    const [selectedLanguages, setSelectedLanguages] = React.useState<number[]>([]);
    const availableLanguages = languages.filter((_l, index) => !selectedLanguages.includes(index));

    const goToPath = (path: string) => (event: React.MouseEvent) => {
        event.preventDefault();
        router.push(path);
    };

    const onAddLanguage = () => {
        setShowModal(false);
        setSelectedLanguages([...selectedLanguages, languagesMap[availableLanguages[languageToAdd].value]]);
        setLanguageToAdd(0);
    };
    const onDeleteLanguage = (deleteIndex: number) => () => {
        const language = languages[selectedLanguages[deleteIndex]];
        const s = [...selectedLanguages];
        s.splice(deleteIndex, 1);
        setSelectedLanguages(s);
        setScenarioNames((prev) => {
            const newNames = { ...prev };
            delete newNames[language.value];
            return newNames;
        });
        setScenarioDescriptions((prev) => {
            const newDesc = { ...prev };
            delete newDesc[language.value];
            return newDesc;
        });
    };

    const onNameInputChange = (languageValue: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setScenarioNames((prev) => ({
            ...prev,
            [languageValue]: event.target.value,
        }));
    };
    const onDescInputChange = (languageValue: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setScenarioDescriptions((prev) => ({
            ...prev,
            [languageValue]: event.target.value,
        }));
    };

    const onThemeSelect = (event: SelectChangeEvent<string | number>) => {
        setThemeId(typeof event.target.value === 'number' ? event.target.value : parseInt(event.target.value, 10));
    };

    const createScenarioMutation = useCreateScenarioMutation();
    const isLoading = createScenarioMutation.isLoading;
    const onSubmit = async () => {
        const usedLanguages = Object.keys(scenarioNames);
        if (themeId === -1 || usedLanguages.length === 0) {
            enqueueSnackbar(themeId === -1 ? "Le thème n'est pas choisit!" : 'Le nom du scénario ne peut pas être vide.', {
                variant: 'error',
            });
            return;
        }

        try {
            await createScenarioMutation.mutateAsync({
                themeId,
                names: scenarioNames,
                descriptions: scenarioDescriptions,
                isDefault: true,
            });
            enqueueSnackbar('Scénario créé avec succès!', {
                variant: 'success',
            });
            router.push('/admin/scenarios');
        } catch (err) {
            console.error(err);
            enqueueSnackbar('Une erreur inconnue est survenue...', {
                variant: 'error',
            });
        }
    };

    return (
        <div style={{ paddingBottom: '2rem' }}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="large" color="primary" />} aria-label="breadcrumb">
                <Link href="/admin/scenarios" onClick={goToPath('/admin/scenarios')}>
                    <Typography variant="h1" color="primary">
                        Scénarios
                    </Typography>
                </Link>
                <Typography variant="h1" color="textPrimary">
                    Nouveau
                </Typography>
            </Breadcrumbs>
            <AdminTile title="Créer un scénario">
                <div style={{ padding: '1rem' }}>
                    <Typography variant="h3" color="textPrimary">
                        Thème associé:
                    </Typography>
                    <div style={{ padding: '8px 16px 16px 16px', width: '100%' }}>
                        <FormControl fullWidth color="secondary">
                            <InputLabel id="demo-simple-select-label">Choisir le thème associé</InputLabel>
                            <Select
                                variant="standard"
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={themeId === -1 ? '' : themeId}
                                onChange={onThemeSelect}
                            >
                                {themes.map((theme) => (
                                    <MenuItem value={theme.id} key={theme.id}>
                                        {theme.names.fr}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                    <br />
                    <Typography variant="h3" color="textPrimary">
                        Scénario :
                    </Typography>
                    {selectedLanguages.map((languageIndex, index) => (
                        <Card key={languages[languageIndex].value} variant="outlined" style={{ margin: '8px 0' }}>
                            <CardActions>
                                <div style={{ marginLeft: '8px', fontWeight: 'bold' }}>{languages[languageIndex].label}</div>
                                {selectedLanguages.length > 1 && (
                                    <IconButton style={{ marginLeft: 'auto' }} size="small" onClick={onDeleteLanguage(index)}>
                                        <Close />
                                    </IconButton>
                                )}
                            </CardActions>
                            <CardContent style={{ paddingTop: '0' }}>
                                <TextField
                                    variant="standard"
                                    label="Nom"
                                    value={scenarioNames[languages[languageIndex].value] || ''}
                                    onChange={onNameInputChange(languages[languageIndex].value)}
                                    color="secondary"
                                    fullWidth
                                />
                                <TextField
                                    variant="standard"
                                    style={{ marginTop: '8px' }}
                                    label="Description"
                                    value={scenarioDescriptions[languages[languageIndex].value] || ''}
                                    onChange={onDescInputChange(languages[languageIndex].value)}
                                    color="secondary"
                                    multiline
                                    fullWidth
                                />
                            </CardContent>
                        </Card>
                    ))}
                    {availableLanguages.length > 0 && (
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setShowModal(true);
                            }}
                        >
                            Ajouter une langue
                        </Button>
                    )}

                    <div style={{ width: '100%', textAlign: 'center', marginTop: '1rem' }}>
                        <Button color="secondary" variant="contained" onClick={onSubmit}>
                            Créer le scénario !
                        </Button>
                    </div>
                </div>
            </AdminTile>
            <Button variant="outlined" style={{ marginTop: '1rem' }} onClick={goToPath('/admin/scenarios')}>
                Retour
            </Button>

            {/* language modal */}
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                }}
                onConfirm={onAddLanguage}
                confirmLabel="Ajouter"
                cancelLabel="Annuler"
                title="Ajouter une langue"
                ariaLabelledBy="add-dialog"
                ariaDescribedBy="add-dialog-desc"
            >
                {availableLanguages.length > 0 && (
                    <FormControl variant="outlined" style={{ minWidth: '15rem' }} className="mobile-full-width">
                        <InputLabel htmlFor="langage">Languages</InputLabel>
                        <Select
                            native
                            value={languageToAdd}
                            onChange={(event) => {
                                setLanguageToAdd(typeof event.target.value === 'number' ? event.target.value : parseInt(event.target.value, 10));
                            }}
                            label={'Langages'}
                            inputProps={{
                                name: 'langage',
                                id: 'langage',
                            }}
                        >
                            {availableLanguages.map((l, index) => (
                                <option value={index} key={l.value}>
                                    {l.label}
                                </option>
                            ))}
                        </Select>
                    </FormControl>
                )}
            </Modal>
            <Loader isLoading={isLoading} />
        </div>
    );
};

export default AdminNewScenario;
