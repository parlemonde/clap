'use client';

import { Cross1Icon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import React from 'react';

import { Button } from '@frontend/components/layout/Button';
import { IconButton } from '@frontend/components/layout/Button/IconButton';
import { Flex, FlexItem } from '@frontend/components/layout/Flex';
import { Field, Form, Input, TextArea } from '@frontend/components/layout/Form';
import { Select } from '@frontend/components/layout/Form/Select';
import { Modal } from '@frontend/components/layout/Modal';
import { Title } from '@frontend/components/layout/Typography';
import { Loader } from '@frontend/components/ui/Loader';
import { sendToast } from '@frontend/components/ui/Toasts';
import { useLanguages } from '@frontend/hooks/useLanguages';

import type { Scenario } from '@server/database/schemas/scenarios';
import type { Theme } from '@server/database/schemas/themes';

import { createAdminScenario } from '@server-actions/scenarios/create-scenario';

type Language = {
    label: string;
    value: string;
};

type NewScenarioFormProps = {
    defaultThemeId?: number;
    themes: Theme[];
};

export const NewScenarioForm = ({ themes, defaultThemeId = -1 }: NewScenarioFormProps) => {
    const router = useRouter();

    const languages = useLanguages();
    const languagesMap = languages.reduce(
        (acc: { [key: string]: number }, language: Language, index: number) => ({ ...acc, [language.value]: index }),
        {},
    );

    const [themeId, setThemeId] = React.useState(defaultThemeId);
    const [scenarioNames, setScenarioNames] = React.useState<Scenario['names']>({});
    const [scenarioDescriptions, setScenarioDescriptions] = React.useState<Scenario['descriptions']>({});

    const [showModal, setShowModal] = React.useState<boolean>(false);
    const [languageToAdd, setLanguageToAdd] = React.useState<number>(0);
    const [selectedLanguages, setSelectedLanguages] = React.useState<number[]>([]);
    const availableLanguages = languages.filter((_l, index) => !selectedLanguages.includes(index));

    const [isLoading, setIsLoading] = React.useState<boolean>(false);

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
        setScenarioNames((prev) => {
            const newNames = { ...prev };
            delete newNames[language.value];
            return newNames;
        });
        setScenarioDescriptions((prev) => {
            const newDesc = { ...prev };
            delete newDesc[language.value];
            return newDesc;
        });
    };

    const onNameInputChange = (languageValue: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setScenarioNames((prev) => ({
            ...prev,
            [languageValue]: event.target.value,
        }));
    };
    const onDescInputChange = (languageValue: string) => (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setScenarioDescriptions((prev) => ({
            ...prev,
            [languageValue]: event.target.value,
        }));
    };

    const onSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (themeId === -1) {
            sendToast({ message: "Le thème n'est pas choisit !", type: 'error' });
            return;
        }

        setIsLoading(true);

        const newScenarioNames = { ...scenarioNames };

        // Clear blank spaces
        for (const [key, value] of Object.entries(newScenarioNames)) {
            newScenarioNames[key] = value.trim();
        }

        // Check if name are not empty with blank space
        const scenarioNamesValue = Object.values(newScenarioNames);
        const clearedScenarioNames = scenarioNamesValue.filter((lang) => lang.trim().length > 0);
        if (scenarioNamesValue.length === 0 || clearedScenarioNames.length !== scenarioNamesValue.length) {
            sendToast({ message: 'Veuillez remplir correctement le nom pour chaque langue sélectionnée', type: 'error' });
        }

        try {
            await createAdminScenario({
                themeId,
                names: newScenarioNames,
                descriptions: scenarioDescriptions,
            });
            sendToast({ message: 'Scénario créé avec succès!', type: 'success' });
            router.push('/admin/scenarios');
        } catch (err) {
            console.error(err);
            sendToast({ message: 'Une erreur inconnue est survenue...', type: 'error' });
        }
        setIsLoading(false);
    };

    return (
        <div style={{ padding: '1rem' }}>
            <Field
                name="theme-select"
                label={
                    <Title variant="h3" color="primary">
                        Thème associé:
                    </Title>
                }
                input={
                    <Select
                        name="theme-select"
                        id="theme-select"
                        value={themeId === -1 ? '' : themeId}
                        onChange={(event) => {
                            setThemeId(parseInt(event.target.value, 10));
                        }}
                        isFullWidth
                        style={{ color: themeId === -1 ? 'gray' : undefined }}
                    >
                        <option value="" hidden>
                            Choisissez le thème
                        </option>
                        {themes.map((theme) => (
                            <option value={theme.id} key={theme.id}>
                                {theme.names.fr}
                            </option>
                        ))}
                    </Select>
                }
            ></Field>
            <br />
            <Title variant="h3" color="primary">
                Scénario :
            </Title>

            <Form onSubmit={onSubmit}>
                {selectedLanguages.map((languageIndex, index) => (
                    <div
                        key={languages[languageIndex].value}
                        style={{ margin: '8px 0', border: '1px solid rgba(0, 0, 0, 0.12)', borderRadius: 4, padding: 16 }}
                    >
                        <Flex alignItems="center" marginBottom="md">
                            <FlexItem flexGrow={1} flexBasis={0} style={{ fontWeight: 'bold' }}>
                                {languages[languageIndex].label}
                            </FlexItem>
                            {selectedLanguages.length > 1 && (
                                <IconButton onClick={onDeleteLanguage(index)} icon={Cross1Icon} variant="borderless"></IconButton>
                            )}
                        </Flex>
                        <Field
                            name={`name_for_${languages[languageIndex].value}`}
                            label={<span style={{ fontSize: '14px' }}>Nom</span>}
                            input={
                                <Input
                                    id={`name_for_${languages[languageIndex].value}`}
                                    name={`name_for_${languages[languageIndex].value}`}
                                    placeholder="Entrez le nom"
                                    value={scenarioNames[languages[languageIndex].value] || ''}
                                    onChange={onNameInputChange(languages[languageIndex].value)}
                                    color="secondary"
                                    isFullWidth
                                />
                            }
                        ></Field>
                        <Field
                            marginTop="sm"
                            name={`description_for_${languages[languageIndex].value}`}
                            label={<span style={{ fontSize: '14px' }}>Description</span>}
                            input={
                                <TextArea
                                    id={`description_for_${languages[languageIndex].value}`}
                                    name={`description_for_${languages[languageIndex].value}`}
                                    placeholder="Entrez la description"
                                    value={scenarioDescriptions[languages[languageIndex].value] || ''}
                                    onChange={onDescInputChange(languages[languageIndex].value)}
                                    color="secondary"
                                    isFullWidth
                                />
                            }
                        ></Field>
                    </div>
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

                <div style={{ width: '100%', textAlign: 'center', marginTop: '1rem' }}>
                    <Button label="Créer le scénario !" color="secondary" variant="contained" type="submit"></Button>
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
                onOpenAutoFocus={false}
            >
                {availableLanguages.length > 0 && (
                    <Field
                        name="languages-select"
                        label="Languages"
                        input={
                            <Select
                                name="languages-select"
                                id="languages-select"
                                value={languageToAdd}
                                onChange={(event) => {
                                    setLanguageToAdd(parseInt(event.target.value, 10));
                                }}
                                isFullWidth
                            >
                                {availableLanguages.map((l, index) => (
                                    <option value={index} key={l.value}>
                                        {l.label}
                                    </option>
                                ))}
                            </Select>
                        }
                    ></Field>
                )}
            </Modal>
            <Loader isLoading={isLoading} />
        </div>
    );
};
