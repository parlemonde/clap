import { Pencil1Icon, TrashIcon, PlusCircledIcon, CheckIcon, QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import React from 'react';

import { useLanguages } from 'src/api/languages/languages.list';
import { useDeleteScenarioMutation } from 'src/api/scenarios/scenarios.delete';
import { useScenarios } from 'src/api/scenarios/scenarios.list';
import { useUpdateScenarioMutation } from 'src/api/scenarios/scenarios.put';
import { useThemes } from 'src/api/themes/themes.list';
import { AdminTile } from 'src/components/admin/AdminTile';
import { Table } from 'src/components/admin/Table';
import { Button } from 'src/components/layout/Button';
import { IconButton } from 'src/components/layout/Button/IconButton';
import { Flex } from 'src/components/layout/Flex';
import { Select } from 'src/components/layout/Form/Select';
import { Modal } from 'src/components/layout/Modal';
import { Tooltip } from 'src/components/layout/Tooltip';
import { Title } from 'src/components/layout/Typography';
import { sendToast } from 'src/components/ui/Toasts';
import type { Scenario } from 'types/models/scenario.type';

type ScenarioData = {
    themeIndex: number;
    startIndex: number;
    scenarios: Scenario[];
};

const HelpIcon = () => (
    <Tooltip content="Un scénario non traduit ne sera pas affiché. Il n'est donc pas nécessaire de le traduire si le scénario n'est que pour une langue spécifique.">
        <span style={{ cursor: 'pointer' }}>
            <QuestionMarkCircledIcon style={{ width: '18px', height: '18px', marginLeft: '8px' }} />
        </span>
    </Tooltip>
);

const AdminScenarios = () => {
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

    const deleteScenarioMutation = useDeleteScenarioMutation();
    const onDeleteScenario = async () => {
        if (deleteId === null) {
            return;
        }
        try {
            await deleteScenarioMutation.mutateAsync({
                scenarioId: deleteId,
            });
            sendToast({ message: 'Scénario supprimé avec succès!', type: 'success' });
        } catch (err) {
            console.error(err);
            sendToast({ message: 'Une erreur inconnue est survenue...', type: 'error' });
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
            sendToast({ message: 'Scénario validé avec succès!', type: 'success' });
        } catch (err) {
            console.error(err);
            sendToast({ message: 'Une erreur inconnue est survenue...', type: 'error' });
        }
    };

    const toDeleteScenarioName = React.useMemo(() => {
        const names = deleteId ? scenarios.find((s) => s.id === deleteId)?.names ?? null : null;
        if (names === null || Object.keys(names).length === 0) {
            return '';
        }
        return names[selectedLanguage] || names[Object.keys(names)[0]];
    }, [deleteId, scenarios, selectedLanguage]);

    const selectLanguage = (
        <span style={{ marginLeft: '2rem' }}>
            (
            <Select
                value={selectedLanguage}
                color="secondary"
                onChange={(event) => {
                    setSelectedLanguage(event.target.value);
                }}
                width="unset"
                style={{
                    backgroundColor: 'transparent',
                    color: 'white',
                    borderTop: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                    borderRadius: 0,
                    padding: '4px 26px 4px 4px',
                }}
            >
                {languages.map((l) => (
                    <option key={l.value} value={l.value}>
                        {l.label.toLowerCase()}
                    </option>
                ))}
            </Select>
            )
        </span>
    );

    return (
        <div style={{ margin: '24px 32px' }}>
            <Title>Scénarios</Title>
            <AdminTile
                marginY="md"
                title={
                    <Flex isFullWidth alignItems="center" justifyContent="flex-start">
                        <Title variant="h2" color="inherit">
                            Liste des scénarios par thème
                        </Title>
                        {selectLanguage}
                    </Flex>
                }
                actions={
                    scenariosData.length > 0 ? (
                        <Link href="/admin/scenarios/new" passHref>
                            <Button
                                label="Ajouter un scénario"
                                as="a"
                                variant="contained"
                                color="light-grey"
                                leftIcon={<PlusCircledIcon style={{ width: '20px', height: '20px', marginRight: '8px' }} />}
                            ></Button>
                        </Link>
                    ) : null
                }
            >
                <Table aria-label="tout les scénarios">
                    {scenariosData.length > 0 ? (
                        <>
                            <thead style={{ borderBottom: 'none' }}>
                                <tr>
                                    <th align="left">#</th>
                                    <th align="left">Nom</th>
                                    <th align="left">Description</th>
                                    <th align="right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scenariosData.map((data) => (
                                    <React.Fragment key={`top_${data.themeIndex}`}>
                                        <tr style={{ backgroundColor: 'rgb(84, 136, 115)', color: 'white' }}>
                                            <th
                                                colSpan={4}
                                                style={{
                                                    padding: '4px 16px',
                                                    border: 'none',
                                                }}
                                            >
                                                Thème : {themes[data.themeIndex].names[selectedLanguage] || themes[data.themeIndex].names.fr || ''}
                                            </th>
                                        </tr>
                                        {data.scenarios.length > 0 ? (
                                            data.scenarios.map((s, index) => (
                                                <tr
                                                    style={{ backgroundColor: index % 2 === 0 ? 'white' : 'rgb(224 239 232)' }}
                                                    key={`${data.themeIndex}_${s.id}`}
                                                >
                                                    <th style={{ width: '3rem', padding: '0 16px' }}>{index + data.startIndex + 1}</th>
                                                    <th style={{ color: s.names[selectedLanguage] ? 'inherit' : 'grey', padding: '0 16px' }}>
                                                        {s.names[selectedLanguage] ||
                                                            `${s.names.fr || s.names[Object.keys(s.names)[0]]} (non traduit)`}
                                                        {!s.names[selectedLanguage] && <HelpIcon />}
                                                    </th>
                                                    <th style={{ color: s.descriptions[selectedLanguage] ? 'inherit' : 'grey', padding: '0 16px' }}>
                                                        {s.descriptions[selectedLanguage] || s.descriptions.default}
                                                    </th>
                                                    <th align="right" style={{ minWidth: '96px' }}>
                                                        <Tooltip content="Modifier">
                                                            <span>
                                                                <Link href={`/admin/scenarios/edit/${s.id}`} passHref>
                                                                    <IconButton
                                                                        as="a"
                                                                        margin="xs"
                                                                        aria-label="edit"
                                                                        variant="borderless"
                                                                        icon={Pencil1Icon}
                                                                    ></IconButton>
                                                                </Link>
                                                            </span>
                                                        </Tooltip>
                                                        <Tooltip content="Supprimer">
                                                            <IconButton
                                                                marginY="xs"
                                                                marginRight="sm"
                                                                aria-label="delete"
                                                                onClick={() => {
                                                                    if (typeof s.id === 'number') {
                                                                        setDeleteId(s.id);
                                                                    }
                                                                }}
                                                                variant="borderless"
                                                                color="error"
                                                                icon={TrashIcon}
                                                            ></IconButton>
                                                        </Tooltip>
                                                    </th>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr style={{ backgroundColor: 'white' }} key={`${data.themeIndex}_no_data`}>
                                                <th colSpan={4} align="center" style={{ padding: '4px' }}>
                                                    {`Ce thème n'a pas de scénario ! `}
                                                    <Link href={`/admin/scenarios/new?themeId=${themes[data.themeIndex].id}`} passHref>
                                                        <a>Ajouter un scénario ?</a>
                                                    </Link>
                                                </th>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </>
                    ) : (
                        <tbody>
                            <tr>
                                <th colSpan={4} align="center">
                                    {"Vous n'avez pas de thème ! "}
                                    <Link href="/admin/themes/new" passHref>
                                        <a>Ajouter un thème ?</a>
                                    </Link>
                                </th>
                            </tr>
                        </tbody>
                    )}
                </Table>
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
                isFullWidth
            >
                Voulez-vous vraiment supprimer le scénario <strong>{toDeleteScenarioName}</strong> ?
            </Modal>

            {userScenariosData.length > 0 && (
                <AdminTile
                    marginTop={32}
                    marginBottom="md"
                    title={
                        <Flex isFullWidth alignItems="center" justifyContent="flex-start">
                            <Title variant="h2" color="inherit">
                                Scénarios des utilisateurs
                            </Title>
                            {selectLanguage}
                        </Flex>
                    }
                >
                    <Table aria-label="Scénarios des utilisateurs">
                        <thead style={{ borderBottom: 'none' }}>
                            <tr>
                                <th align="left">#</th>
                                <th align="left">Nom</th>
                                <th align="left">Description</th>
                                <th align="right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userScenariosData.map((data) => (
                                <React.Fragment key={`user_top_${data.themeIndex}`}>
                                    <tr style={{ backgroundColor: 'rgb(84, 136, 115)', color: 'white' }}>
                                        <th
                                            colSpan={4}
                                            style={{
                                                padding: '4px 16px',
                                                border: 'none',
                                            }}
                                        >
                                            {data.themeIndex === -1
                                                ? 'Autres thèmes (créés par les utilisateurs)'
                                                : `Thème : ${
                                                      themes[data.themeIndex].names[selectedLanguage] || themes[data.themeIndex].names.fr || ''
                                                  }`}
                                        </th>
                                    </tr>
                                    {data.scenarios.map((s, index) => (
                                        <tr
                                            key={`${data.themeIndex}_${s.id}`}
                                            style={{ backgroundColor: index % 2 === 0 ? 'white' : 'rgb(224 239 232)' }}
                                        >
                                            <th style={{ width: '3rem', padding: '0 16px' }}>{index + data.startIndex + 1}</th>
                                            <th style={{ color: s.names[selectedLanguage] ? 'inherit' : 'grey', padding: '0 16px' }}>
                                                {s.names[selectedLanguage] || `${s.names.default} (non traduit)`}
                                            </th>
                                            <th style={{ color: s.descriptions[selectedLanguage] ? 'inherit' : 'grey', padding: '0 16px' }}>
                                                {s.descriptions[selectedLanguage] || s.descriptions.default}
                                            </th>
                                            <th align="right" style={{ minWidth: '96px' }}>
                                                {data.themeIndex !== -1 && (
                                                    <Tooltip content="Valider">
                                                        <IconButton
                                                            variant="borderless"
                                                            marginY="xs"
                                                            marginRight="sm"
                                                            aria-label="valider"
                                                            onClick={() => {
                                                                validateScenario(s.id).catch();
                                                            }}
                                                            icon={CheckIcon}
                                                        ></IconButton>
                                                    </Tooltip>
                                                )}
                                            </th>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </Table>
                </AdminTile>
            )}
        </div>
    );
};

export default AdminScenarios;
