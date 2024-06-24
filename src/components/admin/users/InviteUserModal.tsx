import React from 'react';

import { SharedLink } from '../SharedLink';
import { getUsersInvite } from 'src/api/users/users.invite';
import { Modal } from 'src/components/layout/Modal';
import { sendToast } from 'src/components/ui/Toasts';
import { useFollowingRef } from 'src/hooks/useFollowingRef';

interface InviteUserModalProps {
    open?: boolean;
    onClose?(): void;
}

export const InviteUserModal = ({ open = false, onClose = () => {} }: InviteUserModalProps) => {
    const [inviteCode, setInviteCode] = React.useState<string>('');

    const onCLoseRef = useFollowingRef(onClose);
    const getInviteCode = React.useCallback(async () => {
        if (!open) {
            return;
        }
        const { inviteCode } = await getUsersInvite();
        if (inviteCode === null) {
            onCLoseRef.current();
            sendToast({ message: 'Une erreur inconnue est survenue...', type: 'error' });
            return;
        }
        setInviteCode(inviteCode);
    }, [onCLoseRef, open]);

    React.useEffect(() => {
        getInviteCode().catch();
    }, [getInviteCode]);

    return (
        <Modal isOpen={open} width="lg" onClose={onClose} cancelLabel="Retour" title="Inviter un utilisateur" isFullWidth onOpenAutoFocus={false}>
            <div id="add-dialog-description">
                <div>
                    <label style={{ fontWeight: 'bold' }}>{"Code d'invitation :"}</label>
                    <SharedLink link={inviteCode} />
                </div>
                <div style={{ margin: '0.4rem 0 0.8rem 0' }}>
                    <label style={{ fontWeight: 'bold' }}>{"Lien d'invitation :"}</label>
                    <SharedLink link={`${process.env.NEXT_PUBLIC_HOST_URL}/sign-up?inviteCode=${inviteCode}`} />
                </div>
            </div>
        </Modal>
    );
};
