import { useSnackbar } from 'notistack';
import React from 'react';

import { getUsersInvite } from 'src/api/users/users.invite';
import { SharedLink } from 'src/components/SharedLink';
import Modal from 'src/components/ui/Modal';
import { useFollowingRef } from 'src/hooks/useFollowingRef';

interface InviteUserModalProps {
    open?: boolean;
    onClose?(): void;
}

export const InviteUserModal = ({ open = false, onClose = () => {} }: InviteUserModalProps) => {
    const { enqueueSnackbar } = useSnackbar();
    const [inviteCode, setInviteCode] = React.useState<string>('');

    const onCLoseRef = useFollowingRef(onClose);
    const getInviteCode = React.useCallback(async () => {
        if (!open) {
            return;
        }
        const { inviteCode } = await getUsersInvite();
        if (inviteCode === null) {
            onCLoseRef.current();
            enqueueSnackbar('Une erreur inconnue est survenue...', {
                variant: 'error',
            });
            return;
        }
        setInviteCode(inviteCode);
    }, [enqueueSnackbar, onCLoseRef, open]);

    React.useEffect(() => {
        getInviteCode().catch();
    }, [getInviteCode]);

    return (
        <Modal
            isOpen={open}
            onClose={onClose}
            cancelLabel="Retour"
            title="Inviter un utilisateur"
            ariaLabelledBy="add-dialog-title"
            ariaDescribedBy="add-dialog-description"
            isFullWidth
        >
            <div id="add-dialog-description">
                <div>
                    <label style={{ fontWeight: 'bold' }}>{"Code d'invitation :"}</label>
                    <SharedLink link={inviteCode} />
                </div>
                <div style={{ margin: '0.4rem 0 0.8rem 0' }}>
                    <label style={{ fontWeight: 'bold' }}>{"Lien d'invitation :"}</label>
                    <SharedLink link={`${window.location.origin}/sign-up?inviteCode=${inviteCode}`} />
                </div>
            </div>
        </Modal>
    );
};
