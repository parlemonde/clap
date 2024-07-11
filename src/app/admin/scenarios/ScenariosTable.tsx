'use client';

import { Pencil1Icon, QuestionMarkCircledIcon, TrashIcon } from '@radix-ui/react-icons';
import * as React from 'react';

import { deleteScenario } from 'src/actions/scenarios/delete-scenario';
import { Table } from 'src/components/admin/Table';
import { IconButton } from 'src/components/layout/Button/IconButton';
import { Select } from 'src/components/layout/Form/Select';
import { Modal } from 'src/components/layout/Modal';
import { Tooltip } from 'src/components/layout/Tooltip';
import { Link } from 'src/components/navigation/Link';
import type { Scenario } from 'src/database/schemas/scenarios';
import type { Theme } from 'src/database/schemas/themes';

type ScenarioData = {
    themeIndex: number;
    startIndex: number;
    scenarios: Scenario[];
};

type ScenariosTableProps = {
    themes: Theme[];
    scenarios: Scenario[];
};

export const ScenariosTable = ({ themes, scenarios }: ScenariosTableProps) => {
    const languages = [
        {
            label: 'Français',
            value: 'fr',
        },
        {
            label: 'Anglais',
            value: 'en',
        },
    ];

    const [deleteId, setDeleteId] = React.useState<number | null>(null);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [selectedLanguage, setSelectedLanguage] = React.useState<string>('fr');

    const scenariosData: ScenarioData[] = [];
    let currentStartIndex = 0;
    for (let themeIndex = 0; themeIndex < themes.length; themeIndex++) {
        const themeScenarios = scenarios.filter((s) => s.themeId === themes[themeIndex].id);
        scenariosData.push({
            themeIndex: themeIndex,
            startIndex: currentStartIndex,
            scenarios: themeScenarios,
        });
        currentStartIndex += themeScenarios.length;
    }

    const scenarioToDelete = deleteId ? scenarios.find((s) => s.id === deleteId) : null;
    const toDeleteScenarioName =
        scenarioToDelete?.names[selectedLanguage] || scenarioToDelete?.names[Object.keys(scenarioToDelete.names)[0] || ''] || '';

    return (
        <>
            <Table aria-label="tout les scénarios">
                {scenariosData.length > 0 ? (
                    <>
                        <thead style={{ borderBottom: 'none' }}>
                            <tr>
                                <th align="left">#</th>
                                <th align="left">
                                    Nom{' '}
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
                                    </span>
                                    )
                                </th>
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
                                                    {s.names[selectedLanguage] || `${s.names.fr || s.names[Object.keys(s.names)[0]]} (non traduit)`}
                                                    {!s.names[selectedLanguage] && <HelpIcon />}
                                                </th>
                                                <th style={{ color: s.descriptions[selectedLanguage] ? 'inherit' : 'grey', padding: '0 16px' }}>
                                                    {s.descriptions[selectedLanguage] || s.descriptions.default}
                                                </th>
                                                <th align="right" style={{ minWidth: '96px' }}>
                                                    <Tooltip content="Modifier">
                                                        <span>
                                                            <Link href={`/admin/scenarios/edit/${s.id}`} passHref legacyBehavior>
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
                                                                setDeleteId(s.id);
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
                                                <Link href={`/admin/scenarios/new?themeId=${themes[data.themeIndex].id}`}>Ajouter un scénario ?</Link>
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
                                <Link href="/admin/themes/new">Ajouter un thème ?</Link>
                            </th>
                        </tr>
                    </tbody>
                )}
            </Table>
            <Modal
                isOpen={deleteId !== null}
                onClose={() => {
                    setDeleteId(null);
                }}
                onConfirm={async () => {
                    if (deleteId === null) {
                        return;
                    }
                    setIsDeleting(true);
                    await deleteScenario(deleteId);
                    setIsDeleting(false);
                    setDeleteId(null);
                }}
                isLoading={isDeleting}
                confirmLabel="Supprimer"
                confirmLevel="error"
                cancelLabel="Annuler"
                title="Supprimer le scénario ?"
                isFullWidth
            >
                Voulez-vous vraiment supprimer le scénario <strong>{toDeleteScenarioName}</strong> ?
            </Modal>
        </>
    );
};

const HelpIcon = () => (
    <Tooltip content="Un scénario non traduit ne sera pas affiché. Il n'est donc pas nécessaire de le traduire si le scénario n'est que pour une langue spécifique.">
        <span style={{ cursor: 'pointer' }}>
            <QuestionMarkCircledIcon style={{ width: '18px', height: '18px', marginLeft: '8px' }} />
        </span>
    </Tooltip>
);
