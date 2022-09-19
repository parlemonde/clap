import React from 'react';

import { Modal } from 'src/components/Modal';
import { SharedLink } from 'src/components/SharedLink';
import { UserServiceContext } from 'src/services/UserService';

interface InviteUserModalProps {
    open?: boolean;
    onClose?(): void;
}

export const InviteUserModal: React.FunctionComponent<InviteUserModalProps> = ({ open = false, onClose = () => {} }: InviteUserModalProps) => {
    const { axiosLoggedRequest } = React.useContext(UserServiceContext);
    const [inviteCode, setInviteCode] = React.useState<string>('');

    const getInviteCode = React.useCallback(async () => {
        if (!open) {
            return;
        }
        const response = await axiosLoggedRequest({
            method: 'GET',
            url: `/users/invite`,
        });
        if (response.error) {
            onClose();
            return;
        }
        setInviteCode(response.data.inviteCode || '');
    }, [axiosLoggedRequest, onClose, open]);

    React.useEffect(() => {
        getInviteCode().catch();
    }, [getInviteCode]);

    return (
        <Modal
            open={open}
            onClose={onClose}
            cancelLabel="Retour"
            title="Inviter un utilisateur"
            ariaLabelledBy="add-dialog-title"
            ariaDescribedBy="add-dialog-description"
            fullWidth
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
