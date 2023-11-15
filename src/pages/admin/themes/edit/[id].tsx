import { UploadIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import { useDeleteImageMutation } from 'src/api/images/images.delete';
import { useCreateImageMutation } from 'src/api/images/images.post';
import { useLanguages } from 'src/api/languages/languages.list';
import { useTheme } from 'src/api/themes/themes.get';
import { useUpdateThemeMutation } from 'src/api/themes/themes.put';
import { AdminTile } from 'src/components/admin/AdminTile';
import { NameInput } from 'src/components/admin/NameInput';
import { Breadcrumbs } from 'src/components/layout/Breadcrumbs';
import { Button } from 'src/components/layout/Button';
import { Field, Form } from 'src/components/layout/Form';
import { Select } from 'src/components/layout/Form/Select';
import { Modal } from 'src/components/layout/Modal';
import { Title } from 'src/components/layout/Typography';
import type { ImgCroppieRef } from 'src/components/ui/ImgCroppie';
import { ImgCroppie } from 'src/components/ui/ImgCroppie';
import { Loader } from 'src/components/ui/Loader';
import { sendToast } from 'src/components/ui/Toasts';
import { useTranslation } from 'src/i18n/useTranslation';
import { getQueryString } from 'src/utils/get-query-string';
import type { Language } from 'types/models/language.type';
import type { Theme } from 'types/models/theme.type';

const AdminEditTheme = () => {
    const router = useRouter();
    const { t } = useTranslation();

    const themeId = React.useMemo(() => Number(getQueryString(router.query.id)) || 0, [router]);
    const { theme } = useTheme(themeId, { enabled: themeId !== 0 });
    const { languages } = useLanguages();
    const languagesMap = React.useMemo(
        () => languages.reduce((acc: { [key: string]: number }, language: Language, index: number) => ({ ...acc, [language.value]: index }), {}),
        [languages],
    );

    const croppieRef = React.useRef<ImgCroppieRef | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [themeNames, setThemeNames] = React.useState<Theme['names']>({
        fr: '',
    });
    const [showModal, setShowModal] = React.useState<boolean>(false);
    const [languageToAdd, setLanguageToAdd] = React.useState<number>(0);
    const [selectedLanguages, setSelectedLanguages] = React.useState<number[]>([]);
    const [imageUrl, setImageUrl] = React.useState<string | null>(null);
    const [imageBlob, setImageBlob] = React.useState<Blob | null | undefined>(undefined); // undefined: no set. null: deleted.
    const availableLanguages = languages.filter((l, index) => l.value !== 'fr' && !selectedLanguages.includes(index));

    React.useEffect(() => {
        if (theme) {
            setThemeNames(theme.names);
        }
    }, [theme]);

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

    const onImageInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files !== null && event.target.files.length > 0) {
            const url = URL.createObjectURL(event.target.files[0]);
            setImageUrl(url);
        } else {
            setImageUrl(null);
        }
    };
    const onImageUrlClear = () => {
        setImageUrl(null);
        if (inputRef.current !== undefined && inputRef.current !== null) {
            inputRef.current.value = '';
        }
    };
    const onSetImageBlob = async () => {
        if (croppieRef.current) {
            setImageBlob(await croppieRef.current.getBlob());
        }
        onImageUrlClear();
    };

    const createImageMutation = useCreateImageMutation();
    const deleteImageMutation = useDeleteImageMutation();
    const updateThemeMutation = useUpdateThemeMutation();
    const isLoading = createImageMutation.isLoading || deleteImageMutation.isLoading || updateThemeMutation.isLoading;

    const onSubmit = async () => {
        if (!theme) {
            sendToast({ message: "Ce thème n'existe pas...", type: 'error' });
            router.push('/admin/themes');
            return;
        }
        if (!themeNames.fr) {
            sendToast({ message: "Le thème 'fr' ne peut pas être vide.", type: 'error' });
            return;
        }

        // [1] delete previous image if any.
        if (imageBlob !== undefined && theme.imageUrl && theme.imageUrl.startsWith('/api/images')) {
            try {
                await deleteImageMutation.mutateAsync({ imageUrl: theme.imageUrl });
            } catch (err) {
                // ignore delete error
                console.error(err);
            }
        }

        try {
            // 1. Upload image.
            let imageUrl: string | undefined = undefined;
            if (imageBlob === null) {
                imageUrl = '';
            } else if (imageBlob !== undefined) {
                const imageResponse = await createImageMutation.mutateAsync({ image: imageBlob });
                imageUrl = imageResponse.url;
            }

            // 2. Update theme.
            await updateThemeMutation.mutateAsync({
                themeId,
                names: themeNames,
                imageUrl,
            });

            sendToast({ message: 'Thème mis à jour avec succès!', type: 'success' });
            router.push('/admin/themes');
        } catch (err) {
            console.error(err);
            sendToast({ message: t('unknown_error'), type: 'error' });
        }
    };

    const imageSrc = React.useMemo(
        () => (imageBlob === null ? null : imageBlob !== undefined ? window.URL.createObjectURL(imageBlob) : theme?.imageUrl ?? null),
        [theme, imageBlob],
    );

    return (
        <div style={{ margin: '24px 32px' }}>
            <Breadcrumbs
                links={[
                    {
                        href: '/admin/themes',
                        label: <Title style={{ display: 'inline' }}>Thèmes</Title>,
                    },
                ]}
                currentLabel={<Title style={{ display: 'inline' }}>{themeNames.fr}</Title>}
            />
            <AdminTile marginY="md" title="Modifier le thème">
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
                    <div style={{ marginTop: '0.5rem' }}>{imageSrc && <img width="300px" src={imageSrc} />}</div>
                    <input
                        id="theme-image-upload"
                        ref={inputRef}
                        type="file"
                        style={{ display: 'none' }}
                        onChange={onImageInputChange}
                        accept="image/*"
                    />
                    <Button
                        label={imageBlob ? "Changer d'image" : 'Choisir une image'}
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
                    {imageSrc && (
                        <Button
                            label="Supprimer l'image"
                            variant="outlined"
                            color="secondary"
                            marginTop="sm"
                            marginLeft="sm"
                            onClick={() => {
                                setImageBlob(null);
                            }}
                        ></Button>
                    )}
                    <div style={{ width: '100%', textAlign: 'center', marginTop: '16px' }}>
                        <Button label="Modifier le thème !" color="secondary" variant="contained" type="submit"></Button>
                    </div>
                </Form>
            </AdminTile>
            <Link href="/admin/themes" passHref legacyBehavior>
                <Button label="Retour" as="a" variant="outlined" marginTop="md"></Button>
            </Link>

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
            <Modal
                isOpen={imageUrl !== null}
                onClose={onImageUrlClear}
                onConfirm={onSetImageBlob}
                confirmLabel="Valider"
                cancelLabel="Annuler"
                title="Redimensionner l'image"
            >
                {imageUrl !== null && (
                    <div className="text-center">
                        <div style={{ width: '500px', height: '400px', marginBottom: '2rem' }}>
                            <ImgCroppie src={imageUrl} alt="Plan image" ref={croppieRef} imgWidth={420} imgHeight={308} />
                        </div>
                    </div>
                )}
            </Modal>
            <Loader isLoading={isLoading} />
        </div>
    );
};

export default AdminEditTheme;
