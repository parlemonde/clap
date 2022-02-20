import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useQueryClient } from 'react-query';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Backdrop from '@mui/material/Backdrop';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import NoSsr from '@mui/material/NoSsr';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';

import type { ImgCroppieRef } from 'src/components/ImgCroppie';
import { ImgCroppie } from 'src/components/ImgCroppie';
import { Modal } from 'src/components/Modal';
import { AdminTile } from 'src/components/admin/AdminTile';
import { NameInput } from 'src/components/admin/themes/NameInput';
import { UserServiceContext } from 'src/services/UserService';
import { useLanguages } from 'src/services/useLanguages';
import { getQueryString } from 'src/util';
import type { Language } from 'types/models/language.type';
import type { Theme } from 'types/models/theme.type';

const AdminEditTheme: React.FunctionComponent = () => {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const queryClient = useQueryClient();
    const themeId = React.useMemo(() => parseInt(getQueryString(router.query.id), 10) || 0, [router]);
    const { languages, isLoading } = useLanguages();
    const languagesMap = React.useMemo(
        () => languages.reduce((acc: { [key: string]: number }, language: Language, index: number) => ({ ...acc, [language.value]: index }), {}),
        [languages],
    );
    const { axiosLoggedRequest } = React.useContext(UserServiceContext);
    const croppieRef = React.useRef<ImgCroppieRef | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [theme, setTheme] = React.useState<Theme>({
        id: 0,
        names: {
            fr: '',
        },
        isDefault: true,
        image: null,
        order: 0,
    });
    const [showModal, setShowModal] = React.useState<boolean>(false);
    const [languageToAdd, setLanguageToAdd] = React.useState<number>(0);
    const [selectedLanguages, setSelectedLanguages] = React.useState<number[]>([]);
    const [imageUrl, setImageUrl] = React.useState<string | null>(null);
    const [imageBlob, setImageBlob] = React.useState<Blob | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);
    const availableLanguages = languages.filter((l, index) => l.value !== 'fr' && !selectedLanguages.includes(index));

    const goToPath = (path: string) => (event: React.MouseEvent) => {
        event.preventDefault();
        router.push(path);
    };

    const getTheme = React.useCallback(async () => {
        if (isLoading) {
            return;
        }
        const response = await axiosLoggedRequest({
            method: 'GET',
            url: `/themes/${themeId}`,
        });
        if (response.error) {
            router.push('/admin/themes');
        } else {
            setTheme(response.data);
            setSelectedLanguages(
                Object.keys(response.data.names)
                    .filter((key) => key !== 'fr')
                    .map((languageValue) => languagesMap[languageValue] || 0),
            );
        }
    }, [axiosLoggedRequest, router, themeId, isLoading, languagesMap]);

    React.useEffect(() => {
        getTheme().catch((e) => console.error(e));
    }, [getTheme]);

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
        const newTheme = { ...theme };
        delete newTheme.names[language.value];
        setTheme(newTheme);
    };

    const onNameInputChange = (languageValue: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const newTheme = { ...theme };
        newTheme.names[languageValue] = event.target.value;
        setTheme(newTheme);
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
            setTheme({ ...theme, image: null });
            setImageBlob(await croppieRef.current.getBlob());
        }
        onImageUrlClear();
    };

    const onSubmit = async () => {
        if (!theme.names.fr) {
            enqueueSnackbar("Le thème 'fr' ne peut pas être vide.", {
                variant: 'error',
            });
            return;
        }
        setLoading(true);
        try {
            const response = await axiosLoggedRequest({
                method: 'PUT',
                url: `/themes/${themeId}`,
                data: {
                    ...theme,
                },
            });
            if (response.error) {
                enqueueSnackbar('Une erreur inconnue est survenue...', {
                    variant: 'error',
                });
                console.error(response.error);
                return;
            }
            const newTheme = response.data;
            // replace image
            if (imageBlob !== null) {
                const bodyFormData = new FormData();
                bodyFormData.append('image', imageBlob);
                const resp2 = await axiosLoggedRequest({
                    method: 'POST',
                    url: `/themes/${newTheme.id}/image`,
                    headers: { 'Content-Type': 'multipart/form-data' },
                    data: bodyFormData,
                });
                if (resp2.error) {
                    console.error(resp2.error);
                }
                // or delete the image
            } else if (theme.image === null) {
                const resp2 = await axiosLoggedRequest({
                    method: 'DELETE',
                    url: `/themes/${newTheme.id}/image`,
                });
                if (resp2.error) {
                    console.error(resp2.error);
                }
            }
            enqueueSnackbar('Thème mis à jour avec succès!', {
                variant: 'success',
            });
            queryClient.invalidateQueries('themes');
            router.push('/admin/themes');
        } catch (e) {
            enqueueSnackbar('Une erreur inconnue est survenue...', {
                variant: 'error',
            });
            console.error(e);
        }
        setLoading(false);
    };

    const imageSrc = React.useMemo(
        () => (theme.image ? theme.image.path : imageBlob !== null ? window.URL.createObjectURL(imageBlob) : null),
        [theme.image, imageBlob],
    );

    return (
        <div style={{ paddingBottom: '2rem' }}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="large" color="primary" />} aria-label="breadcrumb">
                <Link href="/admin/themes" onClick={goToPath('/admin/themes')}>
                    <Typography variant="h1" color="primary">
                        Thèmes
                    </Typography>
                </Link>
                <Typography variant="h1" color="textPrimary">
                    {theme.names.fr}
                </Typography>
            </Breadcrumbs>
            <NoSsr>
                <AdminTile title="Modifier le thème">
                    <div style={{ padding: '1rem' }}>
                        <Typography variant="h3" color="textPrimary">
                            Noms du thème :
                        </Typography>
                        <NameInput value={theme.names.fr || ''} onChange={onNameInputChange('fr')} />
                        {selectedLanguages.map((languageIndex, index) => (
                            <NameInput
                                key={languages[languageIndex].value}
                                value={theme.names[languages[languageIndex].value] || ''}
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
                        <div style={{ marginTop: '0.5rem' }}>{imageSrc && <img width="300px" src={imageSrc} />}</div>
                        <Button
                            variant="outlined"
                            color="secondary"
                            component="label"
                            startIcon={<CloudUploadIcon />}
                            style={{ marginTop: '0.5rem' }}
                        >
                            {imageSrc ? "Changer d'image" : 'Choisir une image'}
                            <input ref={inputRef} type="file" style={{ display: 'none' }} onChange={onImageInputChange} accept="image/*" />
                        </Button>
                        {imageSrc && (
                            <Button
                                variant="outlined"
                                color="secondary"
                                component="label"
                                style={{ marginTop: '0.5rem', marginLeft: '0.5rem' }}
                                onClick={() => {
                                    setImageBlob(null);
                                    setTheme({ ...theme, image: null });
                                }}
                            >
                                {"Supprimer l'image"}
                            </Button>
                        )}
                        <div style={{ width: '100%', textAlign: 'center', marginTop: '1rem' }}>
                            <Button color="secondary" variant="contained" onClick={onSubmit}>
                                Modifier le thème !
                            </Button>
                        </div>
                    </div>
                </AdminTile>
                <Button variant="outlined" style={{ marginTop: '1rem' }} onClick={goToPath('/admin/themes')}>
                    Retour
                </Button>
                <Backdrop
                    sx={{
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                        color: '#fff',
                    }}
                    open={loading}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>

                {/* language modal */}
                <Modal
                    open={showModal}
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
                    open={imageUrl !== null}
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
            </NoSsr>
        </div>
    );
};

export default AdminEditTheme;
