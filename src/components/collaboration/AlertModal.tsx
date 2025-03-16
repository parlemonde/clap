'use client';

import React from 'react';

import { Modal } from '../layout/Modal';
import type { Sequence } from 'src/lib/project.types';

const COLLABORATION_ALERT_EVENT = 'app::collaboration-alert';

export interface VerifyAlertData {
    questionId: number;
    status: Sequence['status'];
}
export const sendCollaborationVerifyAlert = (detail: VerifyAlertData) => {
    document.dispatchEvent(new CustomEvent<VerifyAlertData>(COLLABORATION_ALERT_EVENT, { detail }));
};

export function AlertModal() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [data, setData] = React.useState<VerifyAlertData | null>(null);

    React.useEffect(() => {
        const onOpen = (event: CustomEvent<VerifyAlertData>) => {
            setIsOpen(true);
            setData(event.detail);
        };
        document.addEventListener(COLLABORATION_ALERT_EVENT, onOpen as EventListener);
        return () => {
            document.removeEventListener(COLLABORATION_ALERT_EVENT, onOpen as EventListener);
        };
    }, []);
    return (
        <>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Collaboration">
                <div>{data?.questionId}</div>
                <div>{data?.status}</div>
            </Modal>
        </>
    );
}
