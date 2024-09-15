import { UploadIcon } from '@radix-ui/react-icons';
import React from 'react';

import { Button } from 'src/components/layout/Button';
import { Modal } from 'src/components/layout/Modal';
import { sendToast } from 'src/components/ui/Toasts';
import type { Language } from 'src/database/schemas/languages';

interface UploadLanguageModalProps {
    language?: Language | null;
    onClose?(): void;
}

export const UploadLanguageModal = ({ language = null, onClose = () => {} }: UploadLanguageModalProps) => {
    const [file, setFile] = React.useState<File | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const onSubmit = async () => {
        if (language === null || file === null) {
            return;
        }
        setIsLoading(true);
        try {
            // TODO
            sendToast({ message: 'Traductions modifiées avec succès!', type: 'success' });
            setFile(null);
            onClose();
        } catch (err) {
            console.error(err);
            sendToast({ message: 'Une erreur inconnue est survenue...', type: 'error' });
        }
        setIsLoading(false);
    };

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files[0]);
        } else {
            setFile(null);
        }
    };

    return (
        <Modal
            isOpen={language !== null}
            onClose={() => {
                setFile(null);
                onClose();
            }}
            isLoading={isLoading}
            onConfirm={onSubmit}
            confirmLabel="Mettre à jour"
            cancelLabel="Annuler"
            title="Mettre à jour la langue"
            isFullWidth
        >
            <div>
                {
                    "Veuillez choisir le fichier .po de la langue pour la mettre à jour. Attention ! Ne vous trompez pas de langue, l'API actuelle ne vérifie pas si la langue dans le fichier .po envoyée correspond bien."
                }
            </div>
            <div style={{ width: '100%', textAlign: 'center', margin: '1rem 0' }}>
                <Button
                    label={
                        file === null ? (
                            <>
                                Choisir le fichier pour la langue :<strong style={{ marginLeft: '0.3rem' }}>{language?.label || ''}</strong>
                            </>
                        ) : (
                            `${file.name} | changer`
                        )
                    }
                    variant="outlined"
                    color="secondary"
                    as="label"
                    isUpperCase={false}
                    role="button"
                    aria-controls="filename"
                    tabIndex={0}
                    onKeyPress={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            document.getElementById('new-language-po')?.click();
                        }
                    }}
                    htmlFor="new-language-po"
                    leftIcon={<UploadIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />}
                />
                <input style={{ display: 'none' }} type="file" accept=".po" id="new-language-po" onChange={onFileChange}></input>
            </div>
        </Modal>
    );
};
