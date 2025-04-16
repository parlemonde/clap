'use client';

import { UploadIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { deleteImage } from 'src/actions/delete-image';
import { updateDefaultTheme } from 'src/actions/themes/update-theme';
import { uploadImage } from 'src/actions/upload-image';
import { NameInput } from 'src/components/admin/NameInput';
import { Button } from 'src/components/layout/Button';
import { Field, Form } from 'src/components/layout/Form';
import { Select } from 'src/components/layout/Form/Select';
import { Modal } from 'src/components/layout/Modal';
import { Title } from 'src/components/layout/Typography';
import { Cropper } from 'src/components/ui/Cropper';
import { Loader } from 'src/components/ui/Loader';
import { sendToast } from 'src/components/ui/Toasts';
import type { Theme } from 'src/database/schemas/themes';
import { useLanguages } from 'src/hooks/useLanguages';

type Language = {
    label: string;
    value: string;
};

type EditThemeFormProps = {
    theme: Theme;
};

export const EditThemeForm = ({ theme }: EditThemeFormProps) => {
    const router = useRouter();

    const languages = useLanguages();
    const languagesMap = languages.reduce(
        (acc: { [key: string]: number }, language: Language, index: number) => ({ ...acc, [language.value]: index }),
        {},
    );

    const [themeNames, setThemeNames] = React.useState(theme.names);
    const [showModal, setShowModal] = React.useState<boolean>(false);
    const [languageToAdd, setLanguageToAdd] = React.useState<number>(0);
    const [selectedLanguages, setSelectedLanguages] = React.useState<number[]>([]);
    const availableLanguages = languages.filter((l, index) => l.value !== 'fr' && !selectedLanguages.includes(index));

    const [newImageBlob, setNewImageBlob] = React.useState<Blob | null | undefined>(undefined); // null = delete current image.
    const newImageUrl = React.useMemo(() => (newImageBlob ? window.URL.createObjectURL(newImageBlob) : null), [newImageBlob]);
    const imageUrl = newImageBlob === null ? '' : newImageUrl || theme.imageUrl;

    const [isLoading, setIsLoading] = React.useState(false);

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
        setThemeNames((prev) => {
            const newNames = { ...prev };
            delete newNames[language.value];
            return newNames;
        });
    };

    const onNameInputChange = (languageValue: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setThemeNames((prev) => ({
            ...prev,
            [languageValue]: event.target.value,
        }));
    };

    const [imageToResizeUrl, setImageToResizeUrl] = React.useState<string | null>(null);
    const onInputUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files !== null && event.target.files.length > 0) {
            setImageToResizeUrl(URL.createObjectURL(event.target.files[0]));
        } else {
            setImageToResizeUrl(null);
        }
        event.target.value = ''; // clear input
    };

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!themeNames.fr) {
            sendToast({ message: "Le thème 'fr' ne peut pas être vide.", type: 'error' });
            return;
        }

        try {
            setIsLoading(true);

            // 1. Delete old image.
            if (theme.imageUrl && newImageBlob !== undefined) {
                await deleteImage(theme.imageUrl, true);
            }

            // 2. Upload image.
            let imageUrlToSubmit: string | null = theme.imageUrl;
            if (newImageBlob === null) {
                imageUrlToSubmit = null;
            } else if (newImageBlob) {
                imageUrlToSubmit = await uploadImage(newImageBlob, true); // upload new image
            }

            // 3. Update theme.
            await updateDefaultTheme({
                themeId: theme.id,
                names: themeNames,
                imageUrl: imageUrlToSubmit,
            });

            // 4. Redirect to list.
            sendToast({ message: 'Thème mis à jour avec succès!', type: 'success' });
            setIsLoading(false);
            router.push('/admin/themes');
        } catch (err) {
            console.error(err);
            sendToast({ message: 'Une erreur est survenue...', type: 'error' });
            setIsLoading(false);
        }
    };

    return (
        <>
            <Form onSubmit={onSubmit} padding="md">
                <Title variant="h3" color="primary">
                    Noms du thème :
                </Title>
                <NameInput value={themeNames.fr || ''} onChange={onNameInputChange('fr')} />
                {selectedLanguages.map((languageIndex, index) => (
                    <NameInput
                        key={languages[languageIndex].value}
                        value={themeNames[languages[languageIndex].value] || ''}
                        language={languages[languageIndex]}
                        onDelete={onDeleteLanguage(index)}
                        onChange={onNameInputChange(languages[languageIndex].value)}
                        canDelete
                    />
                ))}
                {availableLanguages.length > 0 && (
                    <Button
                        label="Ajouter une langue"
                        variant="outlined"
                        onClick={() => {
                            setShowModal(true);
                        }}
                    ></Button>
                )}
                <Title variant="h3" color="primary" marginTop="lg">
                    Image :
                </Title>
                <div style={{ marginTop: '0.5rem' }}>{imageUrl && <Image alt="theme image" width={300} height={210} src={imageUrl} />}</div>
                <input id="theme-image-upload" type="file" style={{ display: 'none' }} onChange={onInputUpload} accept="image/*" />
                <Button
                    label={imageUrl ? "Changer d'image" : 'Choisir une image'}
                    variant="outlined"
                    color="secondary"
                    as="label"
                    isUpperCase={false}
                    role="button"
                    aria-controls="filename"
                    tabIndex={0}
                    onKeyPress={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            document.getElementById('theme-image-upload')?.click();
                        }
                    }}
                    htmlFor={'theme-image-upload'}
                    leftIcon={<UploadIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />}
                    marginTop="sm"
                ></Button>
                {imageUrl && (
                    <Button
                        label="Supprimer l'image"
                        variant="outlined"
                        color="secondary"
                        marginTop="sm"
                        marginLeft="sm"
                        onClick={() => {
                            setNewImageBlob(null);
                        }}
                    ></Button>
                )}
                <div style={{ width: '100%', textAlign: 'center', marginTop: '16px' }}>
                    <Button label="Modifier le thème !" color="secondary" variant="contained" type="submit"></Button>
                </div>
            </Form>
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
            >
                {availableLanguages.length > 0 && (
                    <Form>
                        <Field
                            name="languages"
                            label="Langages"
                            input={
                                <Select
                                    color="secondary"
                                    isFullWidth
                                    value={languageToAdd}
                                    onChange={(event) => {
                                        setLanguageToAdd(
                                            typeof event.target.value === 'number' ? event.target.value : parseInt(event.target.value, 10),
                                        );
                                    }}
                                >
                                    {availableLanguages.map((l, index) => (
                                        <option value={index} key={l.value}>
                                            {l.label}
                                        </option>
                                    ))}
                                </Select>
                            }
                        ></Field>
                    </Form>
                )}
            </Modal>

            {/* image modal */}
            <Cropper
                ratio={30 / 21}
                imageUrl={imageToResizeUrl || ''}
                isOpen={imageToResizeUrl !== null}
                onClose={() => {
                    setImageToResizeUrl(null);
                }}
                maxWidth="600px"
                onCrop={(data) => {
                    setNewImageBlob(data);
                    setImageToResizeUrl(null);
                }}
            />

            <Loader isLoading={isLoading} />
        </>
    );
};
