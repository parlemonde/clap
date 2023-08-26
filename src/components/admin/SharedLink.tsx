import { CopyIcon } from '@radix-ui/react-icons';
import React from 'react';

import { IconButton } from 'src/components/layout/Button/IconButton';
import { Tooltip } from 'src/components/layout/Tooltip';
import { sendToast } from 'src/components/ui/Toasts';

interface SharedLinkProps {
    link?: string;
}

export const SharedLink = ({ link = '' }: SharedLinkProps) => {
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(link);
            sendToast({ message: 'Code copié dans le presse-papier!', type: 'success' });
        } catch (err) {
            console.error(err);
            sendToast({ message: 'Une erreur inconnue est survenue...', type: 'error' });
        }
    };

    return (
        <div className="sharedLink">
            <span>{link}</span>
            {document.queryCommandSupported('copy') && (
                <>
                    <Tooltip content="Cliquez pour copier">
                        <IconButton color="primary" aria-label="copy" onClick={copyToClipboard} icon={CopyIcon}></IconButton>
                    </Tooltip>
                </>
            )}
        </div>
    );
};
