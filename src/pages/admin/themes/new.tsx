import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import { useCreateImageMutation } from 'src/api/images/images.post';
import { useLanguages } from 'src/api/languages/languages.list';
import { useThemes } from 'src/api/themes/themes.list';
import { useCreateThemeMutation } from 'src/api/themes/themes.post';
import { AdminTile } from 'src/components/admin/AdminTile';
import { NameInput } from 'src/components/admin/NameInput';
import { Breadcrumbs } from 'src/components/layout/Breadcrumbs';
import { Button } from 'src/components/layout/Button';
import { Field, Form } from 'src/components/layout/Form';
import { Select } from 'src/components/layout/Form/Select';
import { Modal } from 'src/components/layout/Modal';
import { Title } from 'src/components/layout/Typography';
import { ImageCropper } from 'src/components/ui/ImageCropper/ImageCropper';
import { Loader } from 'src/components/ui/Loader';
import { sendToast } from 'src/components/ui/Toasts';
import { useTranslation } from 'src/i18n/useTranslation';
import type { Language } from 'types/models/language.type';
import type { Theme } from 'types/models/theme.type';

const AdminNewTheme = () => {
    const router = useRouter();
    const { t } = useTranslation();

    const { themes: defaultThemes } = useThemes({ isDefault: true });
    const { languages } = useLanguages();
    const languagesMap = languages.reduce(
        (acc: { [key: string]: number }, language: Language, index: number) => ({ ...acc, [language.value]: index }),
        {},
    );

    const [themeNames, setThemeNames] = React.useState<Theme['names']>({
        fr: '',
    });
    const [showModal, setShowModal] = React.useState<boolean>(false);
    const [languageToAdd, setLanguageToAdd] = React.useState<number>(0);
    const [selectedLanguages, setSelectedLanguages] = React.useState<number[]>([]);
    const [imageBlob, setImageBlob] = React.useState<Blob | null>(null);
    const availableLanguages = languages.filter((l, index) => l.value !== 'fr' && !selectedLanguages.includes(index));

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

    const createImageMutation = useCreateImageMutation();
    const createThemeMutation = useCreateThemeMutation();
    const isLoading = createImageMutation.isLoading || createThemeMutation.isLoading;

    const onSubmit = async () => {
        if (!themeNames.fr) {
            sendToast({ message: "Le thème 'fr' ne peut pas être vide.", type: 'error' });
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
            sendToast({ message: 'Thème créé avec succès!', type: 'success' });
            router.push('/admin/themes');
        } catch (err) {
            console.error(err);
            sendToast({ message: t('unknown_error'), type: 'error' });
        }
    };

    return (
        <div style={{ margin: '24px 32px' }}>
            <Breadcrumbs
                links={[
                    {
                        href: '/admin/themes',
                        label: <Title style={{ display: 'inline' }}>Thèmes</Title>,
                    },
                ]}
                currentLabel={<Title style={{ display: 'inline' }}>Nouveau</Title>}
            />
            <AdminTile marginY="md" title="Ajouter un thème">
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
                    <ImageCropper image={null} setImage={setImageBlob} />
                    <div style={{ width: '100%', textAlign: 'center', marginTop: '16px' }}>
                        <Button label="Créer le thème !" color="secondary" variant="contained" type="submit"></Button>
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

            <Loader isLoading={isLoading} />
        </div>
    );
};

export default AdminNewTheme;
