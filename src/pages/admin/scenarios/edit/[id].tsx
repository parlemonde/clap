import { Cross1Icon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import { useLanguages } from 'src/api/languages/languages.list';
import { useScenario } from 'src/api/scenarios/scenarios.get';
import { useUpdateScenarioMutation } from 'src/api/scenarios/scenarios.put';
import { AdminTile } from 'src/components/admin/AdminTile';
import { Breadcrumbs } from 'src/components/layout/Breadcrumbs';
import { Button } from 'src/components/layout/Button';
import { IconButton } from 'src/components/layout/Button/IconButton';
import { Flex, FlexItem } from 'src/components/layout/Flex';
import { Field, Form, Input, TextArea } from 'src/components/layout/Form';
import { Select } from 'src/components/layout/Form/Select';
import { Modal } from 'src/components/layout/Modal';
import { Title } from 'src/components/layout/Typography';
import { Loader } from 'src/components/ui/Loader';
import { sendToast } from 'src/components/ui/Toasts';
import { getQueryString } from 'src/utils/get-query-string';
import type { Language } from 'types/models/language.type';
import type { Scenario } from 'types/models/scenario.type';

const AdminEditScenario = () => {
    const router = useRouter();
    const scenarioId = React.useMemo(() => Number(getQueryString(router.query.id)) || 0, [router]);

    const { scenario } = useScenario(scenarioId, { enabled: scenarioId !== 0 });
    const { languages } = useLanguages();
    const languagesMap = React.useMemo(
        () => languages.reduce((acc: { [key: string]: number }, language: Language, index: number) => ({ ...acc, [language.value]: index }), {}),
        [languages],
    );

    const [scenarioNames, setScenarioNames] = React.useState<Scenario['names']>({});
    const [scenarioDescriptions, setScenarioDescriptions] = React.useState<Scenario['descriptions']>({});
    const [showModal, setShowModal] = React.useState<boolean>(false);
    const [languageToAdd, setLanguageToAdd] = React.useState<number>(0);
    const [selectedLanguages, setSelectedLanguages] = React.useState<number[]>([]);
    const availableLanguages = languages.filter((_l, index) => !selectedLanguages.includes(index));

    React.useEffect(() => {
        if (scenario) {
            setScenarioNames(scenario.names);
            setScenarioDescriptions(scenario.descriptions);
            setSelectedLanguages([...new Set(Object.keys(scenario.names).map((l) => languagesMap[l]))]);
        }
    }, [scenario, languagesMap]);

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

    const updateScenarioMutation = useUpdateScenarioMutation();
    const isLoading = updateScenarioMutation.isLoading;
    const onSubmit = async () => {
        if (!scenario) {
            sendToast({ message: "Ce scénario n'existe pas...", type: 'error' });
            router.push('/admin/scenarios');
            return;
        }

        // Check if name are not empty with blank space
        const scenarioNamesValue = Object.values(scenarioNames);
        const clearedScenarioNames = scenarioNamesValue.filter((lang) => lang.trim().length > 0);
        if (scenarioNamesValue.length === 0 || clearedScenarioNames.length !== scenarioNamesValue.length) {
            sendToast({ message: 'Veuillez remplir correctement le nom pour chaque langue sélectionnée', type: 'error' });
        }

        // Clear blank spaces
        for (const [key, value] of Object.entries(scenarioNames)) {
            scenarioNames[key] = value.trim();
        }

        try {
            await updateScenarioMutation.mutateAsync({
                scenarioId,
                names: scenarioNames,
                descriptions: scenarioDescriptions,
            });
            sendToast({ message: 'Scénario mis à jour avec succès!', type: 'success' });
            router.push('/admin/scenarios');
        } catch (err) {
            console.error(err);
            sendToast({ message: 'Une erreur inconnue est survenue...', type: 'error' });
        }
    };

    return (
        <div style={{ margin: '24px 32px' }}>
            <Breadcrumbs
                links={[
                    {
                        href: '/admin/scenarios',
                        label: <Title style={{ display: 'inline' }}>Scénarios</Title>,
                    },
                ]}
                currentLabel={<Title style={{ display: 'inline' }}>Modifier un scenario</Title>}
            />
            <AdminTile marginY="md" title="Modifier un scénario">
                <Form padding="md" onSubmit={onSubmit}>
                    <Title variant="h3" color="primary">
                        Scénario :
                    </Title>
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
                        <Button label="Modifier le scénario !" color="secondary" variant="contained" type="submit"></Button>
                    </div>
                </Form>
            </AdminTile>
            <Link href="/admin/scenarios" passHref legacyBehavior>
                <Button as="a" label="Retour" variant="outlined" marginTop="md"></Button>
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

export default AdminEditScenario;
