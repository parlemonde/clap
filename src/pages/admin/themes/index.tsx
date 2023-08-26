import { DragHandleDots2Icon, Pencil1Icon, TrashIcon, PlusCircledIcon, CheckIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import * as React from 'react';

import { useLanguages } from 'src/api/languages/languages.list';
import { useDeleteThemeMutation } from 'src/api/themes/themes.delete';
import { useThemes } from 'src/api/themes/themes.list';
import { useReorderThemesMutation } from 'src/api/themes/themes.order';
import { useUpdateThemeMutation } from 'src/api/themes/themes.put';
import { AdminTile } from 'src/components/admin/AdminTile';
import { Table } from 'src/components/admin/Table';
import { Button } from 'src/components/layout/Button';
import { IconButton } from 'src/components/layout/Button/IconButton';
import { Select } from 'src/components/layout/Form/Select';
import { Modal } from 'src/components/layout/Modal';
import { Tooltip } from 'src/components/layout/Tooltip';
import { Title } from 'src/components/layout/Typography';
import { Sortable } from 'src/components/ui/Sortable';
import { sendToast } from 'src/components/ui/Toasts';
import type { Theme } from 'types/models/theme.type';

const ThemesPage = () => {
    const { themes: defaultThemes } = useThemes({ isDefault: true });
    const { themes: userThemes } = useThemes({ isDefault: false });
    const { languages } = useLanguages();

    const [selectedLanguage, setSelectedLanguage] = React.useState<string>('fr');
    const [deleteIndex, setDeleteIndex] = React.useState<number | null>(null);

    const updateThemeMutation = useUpdateThemeMutation();
    const validateTheme = async (themeId: number | string) => {
        if (typeof themeId === 'string') {
            return;
        }
        try {
            await updateThemeMutation.mutateAsync({
                themeId,
                isDefault: true,
                order: Math.max(0, ...defaultThemes.map((t) => t.order + 1)),
            });
            sendToast({ message: 'Thème ajouté aux défauts avec succès!', type: 'success' });
        } catch (err) {
            console.error(err);
            sendToast({ message: 'Une erreur inconue est survenue...', type: 'error' });
        }
    };

    const reorderThemesMutation = useReorderThemesMutation();
    const setThemesOrder = (themes: Theme[]) => {
        reorderThemesMutation.mutate(
            {
                order: themes.map((theme) => theme.id).filter((id): id is number => typeof id === 'number'),
            },
            {
                onError(error) {
                    console.error(error);
                    sendToast({ message: 'Une erreur inconue est survenue...', type: 'error' });
                },
            },
        );
    };

    const deleteThemeMutation = useDeleteThemeMutation();
    const onDeleteTheme = async () => {
        const themeId = deleteIndex ? defaultThemes[deleteIndex].id : null;
        if (!themeId || typeof themeId === 'string') {
            return;
        }
        try {
            await deleteThemeMutation.mutateAsync({ themeId });
            sendToast({ message: 'Thème supprimé avec succès!', type: 'success' });
        } catch (err) {
            console.error(err);
            sendToast({ message: 'Une erreur inconue est survenue...', type: 'error' });
        }
        setDeleteIndex(null);
    };

    return (
        <div style={{ margin: '24px 32px' }}>
            <Title>Thèmes</Title>
            <AdminTile
                marginY="md"
                title="Liste des thèmes"
                actions={
                    <Link href="/admin/themes/new" passHref>
                        <Button
                            label="Ajouter un thème"
                            as="a"
                            variant="contained"
                            color="light-grey"
                            leftIcon={<PlusCircledIcon style={{ width: '20px', height: '20px', marginRight: '8px' }} />}
                        ></Button>
                    </Link>
                }
            >
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
                        <>
                            <Sortable component="tbody" list={defaultThemes} setList={setThemesOrder} handle=".theme-index">
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
                                        <th>
                                            {t.imageUrl ? <img style={{ display: 'table-cell' }} height="40" src={t.imageUrl} /> : 'Aucune image'}
                                        </th>
                                        <th align="right" style={{ minWidth: '96px' }}>
                                            <Tooltip content="Modifier">
                                                <span>
                                                    <Link href={`/admin/themes/edit/${t.id}`} passHref>
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
                            </Sortable>
                        </>
                    ) : (
                        <tbody>
                            <tr>
                                <th colSpan={4} align="center" style={{ padding: '8px 0' }}>
                                    Cette liste est vide !{' '}
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
                isOpen={deleteIndex !== null}
                onClose={() => {
                    setDeleteIndex(null);
                }}
                onConfirm={onDeleteTheme}
                confirmLabel="Supprimer"
                confirmLevel="error"
                cancelLabel="Annuler"
                title="Supprimer le thème ?"
                isFullWidth
                isLoading={deleteThemeMutation.isLoading}
            >
                <p>
                    Voulez-vous vraiment supprimer le thème <strong>{deleteIndex !== null && defaultThemes[deleteIndex].names.fr}</strong> ?
                </p>
            </Modal>

            {userThemes.length > 0 && (
                <AdminTile title="Thèmes des utilisateurs" marginY="xl">
                    <Table aria-label="tout les thèmes">
                        <thead>
                            <tr>
                                <th align="left">Nom</th>
                                <th align="right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userThemes.map((t) => (
                                <tr key={t.id}>
                                    <th style={{ padding: '0 16px' }}>{t.names.fr}</th>
                                    <th align="right">
                                        <Tooltip content="Valider le thème">
                                            <IconButton
                                                margin="xs"
                                                variant="borderless"
                                                aria-label="valider"
                                                onClick={() => validateTheme(t.id)}
                                                icon={CheckIcon}
                                            ></IconButton>
                                        </Tooltip>
                                    </th>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </AdminTile>
            )}
        </div>
    );
};

export default ThemesPage;
