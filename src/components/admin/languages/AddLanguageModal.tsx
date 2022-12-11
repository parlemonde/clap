import { useSnackbar } from 'notistack';
import React from 'react';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import type { SelectChangeEvent } from '@mui/material/Select';
import Select from '@mui/material/Select';

import allLanguages from './iso_languages.json';
import { useCreateLanguageMutation } from 'src/api/languages/languages.post';
import Modal from 'src/components/ui/Modal';

interface AddLanguageModalProps {
    open?: boolean;
    onClose?(): void;
}

export const AddLanguageModal = ({ open = false, onClose = () => {} }: AddLanguageModalProps) => {
    const { enqueueSnackbar } = useSnackbar();
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
            enqueueSnackbar('Langue ajoutée avec succès!', {
                variant: 'success',
            });
            setSelectedLanguageIndex(-1);
            onClose();
        } catch (err) {
            console.error(err);
            enqueueSnackbar('Une erreur inconnue est survenue...', {
                variant: 'error',
            });
        }
    };

    const onSelectLanguage = (event: SelectChangeEvent<string | number>) => {
        setSelectedLanguageIndex(typeof event.target.value === 'number' ? event.target.value : parseInt(event.target.value, 10));
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
            ariaLabelledBy="new-dialog-title"
            ariaDescribedBy="new-dialog-description"
            isFullWidth
        >
            <div id="new-dialog-description">
                <FormControl fullWidth color="secondary">
                    <InputLabel id="demo-simple-select-label">Choisir la langue</InputLabel>
                    <Select
                        variant="standard"
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={selectedLanguageIndex === -1 ? '' : selectedLanguageIndex}
                        onChange={onSelectLanguage}
                    >
                        {allLanguages.map((l, index) => (
                            <MenuItem value={index} key={l.code}>
                                {l.englishName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>
        </Modal>
    );
};
