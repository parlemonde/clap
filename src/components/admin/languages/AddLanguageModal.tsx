import React from 'react';

import allLanguages from './iso_languages.json';
import { useCreateLanguageMutation } from 'src/api/languages/languages.post';
import { Field } from 'src/components/layout/Form';
import { Select } from 'src/components/layout/Form/Select';
import { Modal } from 'src/components/layout/Modal';
import { sendToast } from 'src/components/ui/Toasts';

interface AddLanguageModalProps {
    open?: boolean;
    onClose?(): void;
}

export const AddLanguageModal = ({ open = false, onClose = () => {} }: AddLanguageModalProps) => {
    const [selectedLanguageIndex, setSelectedLanguageIndex] = React.useState<number>(-1);

    const createLanguageMutation = useCreateLanguageMutation();
    const onSubmit = async () => {
        if (selectedLanguageIndex === -1) {
            return;
        }
        try {
            await createLanguageMutation.mutateAsync({
                value: allLanguages[selectedLanguageIndex].code,
                label: allLanguages[selectedLanguageIndex].englishName,
            });
            sendToast({ message: 'Langue ajoutée avec succès!', type: 'success' });
            setSelectedLanguageIndex(-1);
            onClose();
        } catch (err) {
            console.error(err);
            sendToast({ message: 'Une erreur inconnue est survenue...', type: 'error' });
        }
    };

    return (
        <Modal
            isOpen={open}
            isLoading={createLanguageMutation.isLoading}
            onClose={() => {
                setSelectedLanguageIndex(-1);
                onClose();
            }}
            onConfirm={onSubmit}
            confirmLabel="Ajouter"
            cancelLabel="Annuler"
            title="Ajouter une langue"
            isFullWidth
        >
            <Field
                name="create-language"
                label="Choisir la langue"
                input={
                    <Select
                        name="create-language"
                        id="create-language"
                        value={selectedLanguageIndex === -1 ? '' : selectedLanguageIndex}
                        onChange={(event) => {
                            setSelectedLanguageIndex(parseInt(event.target.value, 10));
                        }}
                        style={{ color: selectedLanguageIndex === -1 ? 'grey' : undefined }}
                    >
                        <option value="" hidden></option>
                        {allLanguages.map((l, index) => (
                            <option value={index} key={l.code}>
                                {l.englishName}
                            </option>
                        ))}
                    </Select>
                }
            ></Field>
        </Modal>
    );
};
