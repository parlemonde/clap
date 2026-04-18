import { UploadIcon } from '@radix-ui/react-icons';
import React from 'react';

import { Button } from '@frontend/components/layout/Button';
import { Modal } from '@frontend/components/layout/Modal';
import { sendToast } from '@frontend/components/ui/Toasts';
import type { LanguageOption } from '@server/database/schemas/languages';

interface UploadLanguageModalProps {
    language?: LanguageOption | null;
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
            const formData = new FormData();
            formData.append('language', file);
            await fetch(`/api/locales/${language.value}.json`, {
                method: 'PUT',
                body: formData,
            });
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
            <div>{'Veuillez choisir le fichier .json des traductions au format next-intl pour mettre à jour cette langue.'}</div>
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
                            document.getElementById('new-language-json')?.click();
                        }
                    }}
                    htmlFor="new-language-json"
                    leftIcon={<UploadIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />}
                />
                <input style={{ display: 'none' }} type="file" accept=".json" id="new-language-json" onChange={onFileChange}></input>
            </div>
        </Modal>
    );
};
