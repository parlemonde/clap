import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React from 'react';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';

import { useCreateImageMutation } from 'src/api/images/images.post';
import { useLanguages } from 'src/api/languages/languages.list';
import { useThemes } from 'src/api/themes/themes.list';
import { useCreateThemeMutation } from 'src/api/themes/themes.post';
import type { ImgCroppieRef } from 'src/components/ImgCroppie';
import { ImgCroppie } from 'src/components/ImgCroppie';
import { AdminTile } from 'src/components/admin/AdminTile';
import { NameInput } from 'src/components/admin/themes/NameInput';
import { Loader } from 'src/components/layout/Loader';
import Modal from 'src/components/ui/Modal';
import { useTranslation } from 'src/i18n/useTranslation';
import type { Language } from 'types/models/language.type';
import type { Theme } from 'types/models/theme.type';

const AdminNewTheme = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();

    const { themes: defaultThemes } = useThemes({ isDefault: true });
    const { languages } = useLanguages();
    const languagesMap = languages.reduce(
        (acc: { [key: string]: number }, language: Language, index: number) => ({ ...acc, [language.value]: index }),
        {},
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
    const [imageBlob, setImageBlob] = React.useState<Blob | null>(null);
    const availableLanguages = languages.filter((l, index) => l.value !== 'fr' && !selectedLanguages.includes(index));

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
    const createThemeMutation = useCreateThemeMutation();
    const isLoading = createImageMutation.isLoading || createThemeMutation.isLoading;

    const onSubmit = async () => {
        if (!themeNames.fr) {
            enqueueSnackbar("Le thème 'fr' ne peut pas être vide.", {
                variant: 'error',
            });
            return;
        }

        try {
            // 1. Upload image.
            let imageUrl: string | undefined = undefined;
            if (imageBlob !== null) {
                const imageResponse = await createImageMutation.mutateAsync({ image: imageBlob });
                imageUrl = imageResponse.url;
            }

            // 2. Create theme.
            await createThemeMutation.mutateAsync({
                names: themeNames,
                isDefault: true,
                order: Math.max(0, ...defaultThemes.map((t) => t.order + 1)),
                imageUrl,
            });

            // 3. Redirect to list.
            enqueueSnackbar('Thème créé avec succès!', {
                variant: 'success',
            });
            router.push('/admin/themes');
        } catch (err) {
            console.error(err);
            enqueueSnackbar(t('unknown_error'), {
                variant: 'error',
            });
        }
    };

    return (
        <div style={{ paddingBottom: '2rem' }}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="large" color="primary" />} aria-label="breadcrumb">
                <Link href="/admin/themes" onClick={goToPath('/admin/themes')}>
                    <Typography variant="h1" color="primary">
                        Thèmes
                    </Typography>
                </Link>
                <Typography variant="h1" color="textPrimary">
                    Nouveau
                </Typography>
            </Breadcrumbs>
            <AdminTile title="Ajouter un thème">
                <div style={{ padding: '1rem' }}>
                    <Typography variant="h3" color="textPrimary">
                        Noms du thème :
                    </Typography>
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
                            variant="outlined"
                            onClick={() => {
                                setShowModal(true);
                            }}
                        >
                            Ajouter une langue
                        </Button>
                    )}

                    <Typography variant="h3" color="textPrimary" style={{ marginTop: '2rem' }}>
                        Image :
                    </Typography>
                    <div style={{ marginTop: '0.5rem' }}>{imageBlob && <img width="300px" src={window.URL.createObjectURL(imageBlob)} />}</div>
                    <Button variant="outlined" color="secondary" component="label" startIcon={<CloudUploadIcon />} style={{ marginTop: '0.5rem' }}>
                        {imageBlob ? "Changer d'image" : 'Choisir une image'}
                        <input ref={inputRef} type="file" style={{ display: 'none' }} onChange={onImageInputChange} accept="image/*" />
                    </Button>
                    {imageBlob && (
                        <Button
                            variant="outlined"
                            color="secondary"
                            component="label"
                            style={{ marginTop: '0.5rem', marginLeft: '0.5rem' }}
                            onClick={() => {
                                setImageBlob(null);
                            }}
                        >
                            {"Supprimer l'image"}
                        </Button>
                    )}
                    <div style={{ width: '100%', textAlign: 'center', marginTop: '1rem' }}>
                        <Button color="secondary" variant="contained" onClick={onSubmit}>
                            Créer le thème !
                        </Button>
                    </div>
                </div>
            </AdminTile>
            <Button variant="outlined" style={{ marginTop: '1rem' }} onClick={goToPath('/admin/themes')}>
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

            {/* image modal */}
            <Modal
                isOpen={imageUrl !== null}
                onClose={onImageUrlClear}
                onConfirm={onSetImageBlob}
                confirmLabel="Valider"
                cancelLabel="Annuler"
                title="Redimensionner l'image"
                ariaLabelledBy="add-dialog"
                ariaDescribedBy="add-dialog-desc"
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

export default AdminNewTheme;
