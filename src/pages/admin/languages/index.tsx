import { Pencil1Icon, TrashIcon, PlusCircledIcon, DownloadIcon } from '@radix-ui/react-icons';
import React from 'react';

import { useLanguages } from 'src/api/languages/languages.list';
import { AdminTile } from 'src/components/admin/AdminTile';
import { Table } from 'src/components/admin/Table';
import { AddLanguageModal } from 'src/components/admin/languages/AddLanguageModal';
import { DeleteLanguageModal } from 'src/components/admin/languages/DeleteLanguageModal';
import { UploadLanguageModal } from 'src/components/admin/languages/UploadLanguageModal';
import { Button } from 'src/components/layout/Button';
import { IconButton } from 'src/components/layout/Button/IconButton';
import { Tooltip } from 'src/components/layout/Tooltip';
import { Title } from 'src/components/layout/Typography';

const AdminLanguages = () => {
    const { languages } = useLanguages();
    const [isAddModalOpen, setIsAddModalOpen] = React.useState<boolean>(false);
    const [uploadLanguageIndex, setUploadLanguageIndex] = React.useState<number>(-1);
    const [deleteLanguageIndex, setDeleteLanguageIndex] = React.useState<number>(-1);

    return (
        <div style={{ margin: '24px 32px' }}>
            <Title>Langues</Title>
            <AdminTile
                marginY="md"
                title="Liste des langues"
                actions={
                    <Button
                        label="Ajouter une langue"
                        onClick={() => {
                            setIsAddModalOpen(true);
                        }}
                        variant="contained"
                        color="light-grey"
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
            </AdminTile>
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
        </div>
    );
};

export default AdminLanguages;
