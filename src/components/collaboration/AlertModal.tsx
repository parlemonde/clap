'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

import { Modal } from '../layout/Modal';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { COLORS } from 'src/lib/colors';
import type { Sequence } from 'src/lib/project.types';

const COLLABORATION_ALERT_EVENT = 'app::collaboration-alert';

export interface VerifyAlertData {
    questionId: number;
    status: Sequence['status'];
    studentKind?: 'validated' | 'feedback';
}
export const sendCollaborationVerifyAlert = (detail: VerifyAlertData) => {
    document.dispatchEvent(new CustomEvent<VerifyAlertData>(COLLABORATION_ALERT_EVENT, { detail }));
};

export function AlertModal() {
    const router = useRouter();
    const [data, setData] = React.useState<VerifyAlertData | null>(null);
    const { projectData } = useCurrentProject();

    const questions = projectData?.questions || [];
    const questionIndexMap = Object.fromEntries(questions.map((q, index) => [q.id, index]));
    const question = questions.find((q) => q.id === data?.questionId);
    const lastFeedback = question?.feedbacks?.[question?.feedbacks.length - 1];
    const modalContent = getModalContent(data, data ? questionIndexMap[data.questionId] : 0, lastFeedback);

    React.useEffect(() => {
        const onOpen = (event: CustomEvent<VerifyAlertData>) => {
            setData(event.detail);
        };
        document.addEventListener(COLLABORATION_ALERT_EVENT, onOpen as EventListener);
        return () => {
            document.removeEventListener(COLLABORATION_ALERT_EVENT, onOpen as EventListener);
        };
    }, []);

    return (
        <Modal
            isOpen={data !== null}
            onClose={() => {
                if (modalContent.forceUrlOnClose && modalContent.nextUrl) {
                    router.push(modalContent.nextUrl);
                }
                setData(null);
            }}
            title={modalContent.title}
            hasCancelButton={false}
            onConfirm={() => {
                if (modalContent.nextUrl) {
                    router.push(modalContent.nextUrl);
                }
                setData(null);
            }}
            confirmLabel={modalContent.confirmLabel}
        >
            {modalContent.content}
        </Modal>
    );
}

function getModalContent(
    data: VerifyAlertData | null,
    questionIndex: number,
    lastFeedback: string | undefined,
): {
    title: string;
    content: React.ReactNode;
    confirmLabel: string;
    nextUrl?: string;
    forceUrlOnClose?: boolean;
} {
    if (!data) {
        return {
            title: '',
            content: null,
            confirmLabel: '',
            nextUrl: undefined,
        };
    }
    switch (data.status) {
        case 'storyboard':
            return {
                title: 'Retour du professeur',
                content: (
                    <div>
                        Le professeur vous a fait des retours. Modifiez votre travail, puis renvoyer le à validation.
                        <div style={{ backgroundColor: '#f0f0f0', padding: 8, borderRadius: 10, margin: '8px 0' }}>{lastFeedback}</div>
                    </div>
                ),
                confirmLabel: 'Fermer',
                nextUrl: undefined,
            };
        case 'storyboard-validating':
            return {
                title: 'Travail à vérifier',
                content: (
                    <div>
                        Le groupe d'élèves affecté à la <span style={{ color: COLORS[questionIndex] }}>séquence n° {questionIndex}</span> a terminé la
                        partie <b>3 - storyboard</b>. Vous pouvez vérifier leur travail.
                    </div>
                ),
                confirmLabel: 'Voir le travail',
                nextUrl: `/create/3-storyboard#sequence-${questionIndex}`,
            };
        case 'pre-mounting':
            if (data.studentKind === 'validated') {
                return {
                    title: 'Travail validé',
                    content: <div>Le professeur a validé votre travail. Vous pouvez passer au pré-montage !</div>,
                    confirmLabel: 'Continuer',
                    nextUrl: '/create/4-pre-mounting',
                    forceUrlOnClose: true,
                };
            } else {
                return {
                    title: 'Retour du professeur',
                    content: (
                        <div>
                            Le professeur vous a fait des retours. Modifiez votre travail, puis renvoyer le à validation.
                            <div style={{ backgroundColor: '#f0f0f0', padding: 8, borderRadius: 10, margin: '8px 0' }}>{lastFeedback}</div>
                        </div>
                    ),
                    confirmLabel: 'Fermer',
                    nextUrl: undefined,
                };
            }
        case 'pre-mounting-validating':
            return {
                title: 'Travail à vérifier',
                content: (
                    <div>
                        Le groupe d'élèves affecté à la <span style={{ color: COLORS[questionIndex] }}>séquence n° {questionIndex}</span> a terminé la
                        partie <b>4 - prémontage</b>. Vous pouvez vérifier leur travail.
                    </div>
                ),
                confirmLabel: 'Voir le travail',
                nextUrl: `/create/4-pre-mounting/edit?question=${questionIndex}`,
            };
        case 'validated':
            return {
                title: 'Travail validé',
                content: <div>Le professeur a validé votre travail. Vous avez terminé, bravo !</div>,
                confirmLabel: 'Fermer',
            };
        default:
            return {
                title: '',
                content: null,
                confirmLabel: '',
                nextUrl: undefined,
            };
    }
}
