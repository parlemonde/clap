'use client';

import { DownloadIcon, Pencil1Icon, PlusCircledIcon, TrashIcon } from '@radix-ui/react-icons';
import * as React from 'react';

import { AddLanguageModal } from './AddLanguageModal';
import { DeleteLanguageModal } from './DeleteLanguageModal';
import { UploadLanguageModal } from './UploadLanguageModal';
import { AdminTile } from 'src/components/admin/AdminTile';
import { Table } from 'src/components/admin/Table';
import { Button } from 'src/components/layout/Button';
import { IconButton } from 'src/components/layout/Button/IconButton';
import { Tooltip } from 'src/components/layout/Tooltip';
import type { Language } from 'src/database/schemas/languages';

interface LanguagesTableProps {
    languages: Language[];
}

export function LanguagesTable({ languages }: LanguagesTableProps) {
    const [isAddModalOpen, setIsAddModalOpen] = React.useState<boolean>(false);
    const [uploadLanguageIndex, setUploadLanguageIndex] = React.useState<number>(-1);
    const [deleteLanguageIndex, setDeleteLanguageIndex] = React.useState<number>(-1);

    return (
        <AdminTile
            marginY="md"
            title="Liste des langues"
            actions={
                <Button
                    label="Ajouter une langue"
                    variant="contained"
                    color="light-grey"
                    onClick={() => {
                        setIsAddModalOpen(true);
                    }}
                    leftIcon={<PlusCircledIcon style={{ width: '20px', height: '20px', marginRight: '8px' }} />}
                ></Button>
            }
        >
            <Table aria-label="toutes les langues">
                {languages.length > 0 ? (
                    <>
                        <thead>
                            <tr>
                                <th align="left">Code langue</th>
                                <th align="left">Langue</th>
                                <th align="right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {languages.map((l, index) => (
                                <tr key={l.value}>
                                    <th style={{ maxWidth: '2rem', padding: '0 16px' }}>
                                        <strong>{l.value.toUpperCase()}</strong>
                                    </th>
                                    <th style={{ padding: '0 16px' }}>{l.label}</th>
                                    <th align="right" style={{ minWidth: '96px' }}>
                                        <Tooltip content="Télécharger le fichier des traductions (.po)">
                                            <IconButton
                                                as={'a'}
                                                href={`/api/locales/${l.value}.po`}
                                                download
                                                margin="xs"
                                                aria-label="edit"
                                                variant="borderless"
                                                icon={DownloadIcon}
                                            ></IconButton>
                                        </Tooltip>
                                        <Tooltip content="Modifier">
                                            <IconButton
                                                margin="xs"
                                                aria-label="edit"
                                                variant="borderless"
                                                onClick={() => {
                                                    setUploadLanguageIndex(index);
                                                }}
                                                icon={Pencil1Icon}
                                            ></IconButton>
                                        </Tooltip>
                                        {l.value !== 'fr' && (
                                            <Tooltip content="Supprimer">
                                                <IconButton
                                                    marginY="xs"
                                                    marginRight="sm"
                                                    aria-label="delete"
                                                    onClick={() => {
                                                        setDeleteLanguageIndex(index);
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
                        </tbody>
                    </>
                ) : (
                    <tbody>
                        <tr>
                            <th colSpan={3} align="center">
                                Cette liste est vide !{' '}
                                <Button
                                    label="Ajouter une langue ?"
                                    onClick={() => {
                                        setIsAddModalOpen(true);
                                    }}
                                    color="secondary"
                                    variant="borderless"
                                ></Button>
                            </th>
                        </tr>
                    </tbody>
                )}
            </Table>
            <AddLanguageModal
                open={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                }}
            />
            <UploadLanguageModal
                language={uploadLanguageIndex === -1 ? null : languages[uploadLanguageIndex] || null}
                onClose={() => {
                    setUploadLanguageIndex(-1);
                }}
            />
            <DeleteLanguageModal
                language={deleteLanguageIndex === -1 ? null : languages[deleteLanguageIndex] || null}
                onClose={() => {
                    setDeleteLanguageIndex(-1);
                }}
            />
        </AdminTile>
    );
}
