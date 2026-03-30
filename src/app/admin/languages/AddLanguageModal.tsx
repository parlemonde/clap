'use client';

import React from 'react';

import { Field } from '@frontend/components/layout/Form';
import { Select } from '@frontend/components/layout/Form/Select';
import { Modal } from '@frontend/components/layout/Modal';
import { sendToast } from '@frontend/components/ui/Toasts';

import { createLanguage } from '@server-actions/languages/create-language';

import allLanguages from './iso_languages.json';

interface AddLanguageModalProps {
    open?: boolean;
    onClose?(): void;
}

export const AddLanguageModal = ({ open = false, onClose = () => {} }: AddLanguageModalProps) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [selectedLanguageIndex, setSelectedLanguageIndex] = React.useState<number>(-1);

    const onSubmit = async () => {
        if (selectedLanguageIndex === -1) {
            return;
        }
        setIsLoading(true);
        try {
            await createLanguage({
                value: allLanguages[selectedLanguageIndex].value,
                label: allLanguages[selectedLanguageIndex].label,
            });
            sendToast({ message: 'Langue ajoutée avec succès!', type: 'success' });
            setSelectedLanguageIndex(-1);
            onClose();
        } catch (err) {
            console.error(err);
            sendToast({ message: 'Une erreur inconnue est survenue...', type: 'error' });
        }
        setIsLoading(false);
    };

    return (
        <Modal
            isOpen={open}
            isLoading={isLoading}
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
                        isFullWidth
                        style={{ color: selectedLanguageIndex === -1 ? 'grey' : undefined }}
                    >
                        <option value="" hidden></option>
                        {allLanguages.map((l, index) => (
                            <option value={index} key={l.value}>
                                {l.frenchLabel}
                            </option>
                        ))}
                    </Select>
                }
            ></Field>
        </Modal>
    );
};
