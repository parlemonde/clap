'use client';

import { DragHandleDots2Icon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import * as React from 'react';

import { Table } from 'src/components/admin/Table';
import { IconButton } from 'src/components/layout/Button/IconButton';
import { Select } from 'src/components/layout/Form/Select';
import { Modal } from 'src/components/layout/Modal';
import { Tooltip } from 'src/components/layout/Tooltip';
import { Link } from 'src/components/navigation/Link';
import type { Theme } from 'src/database/schemas/themes';

type ThemesTableWithDataProps = {
    defaultThemes: Theme[];
};

export const ThemesTable = ({ defaultThemes }: ThemesTableWithDataProps) => {
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
    const [selectedLanguage, setSelectedLanguage] = React.useState('fr');
    const [deleteIndex, setDeleteIndex] = React.useState<number | null>(null);

    return (
        <>
            <Table aria-label="tout les thèmes">
                <thead>
                    <tr>
                        <th align="left">Ordre</th>
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
                        <th align="left">Image</th>
                        <th align="right">Actions</th>
                    </tr>
                </thead>
                {defaultThemes.length > 0 ? (
                    <tbody>
                        {defaultThemes.map((t, index) => (
                            <tr key={t.id}>
                                <th className="theme-index">
                                    <div style={{ display: 'flex', alignItems: 'center', cursor: 'grab', marginLeft: '8px' }}>
                                        <DragHandleDots2Icon />
                                        {index}
                                    </div>
                                </th>
                                <th style={{ color: t.names[selectedLanguage] ? 'inherit' : 'grey' }}>
                                    {t.names[selectedLanguage] || `${t.names.fr} (non traduit)`}
                                </th>
                                <th>{t.imageUrl ? <img style={{ display: 'table-cell' }} height="40" src={t.imageUrl} /> : 'Aucune image'}</th>
                                <th align="right" style={{ minWidth: '96px' }}>
                                    <Tooltip content="Modifier">
                                        <span>
                                            <Link href={`/admin/themes/edit/${t.id}`} passHref legacyBehavior>
                                                <IconButton as="a" margin="xs" aria-label="edit" variant="borderless" icon={Pencil1Icon}></IconButton>
                                            </Link>
                                        </span>
                                    </Tooltip>
                                    <Tooltip content="Supprimer">
                                        <IconButton
                                            marginY="xs"
                                            marginRight="xs"
                                            aria-label="delete"
                                            onClick={() => {
                                                setDeleteIndex(index);
                                            }}
                                            variant="borderless"
                                            color="error"
                                            icon={TrashIcon}
                                        ></IconButton>
                                    </Tooltip>
                                </th>
                            </tr>
                        ))}
                    </tbody>
                ) : (
                    <tbody>
                        <tr>
                            <th colSpan={4} align="center" style={{ padding: '8px 0' }}>
                                Cette liste est vide ! <Link href="/admin/themes/new">Ajouter un thème ?</Link>
                            </th>
                        </tr>
                    </tbody>
                )}
            </Table>
            <Modal
                isOpen={deleteIndex !== null}
                onClose={() => {
                    setDeleteIndex(null);
                }}
                onConfirm={() => {
                    // TODO
                }}
                confirmLabel="Supprimer"
                confirmLevel="error"
                cancelLabel="Annuler"
                title="Supprimer le thème ?"
                isFullWidth
                isLoading={false} // TODO
            >
                <p>
                    Voulez-vous vraiment supprimer le thème <strong>{deleteIndex !== null && defaultThemes[deleteIndex].names.fr}</strong> ?
                </p>
            </Modal>
        </>
    );
};
