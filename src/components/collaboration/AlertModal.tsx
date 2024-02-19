import { useRouter } from 'next/router';
import React from 'react';

import { Modal } from '../layout/Modal';
import type { ModalProps } from '../layout/Modal/Modal';
import { useTranslation } from 'src/i18n/useTranslation';
import { COLORS } from 'src/utils/colors';
import { useQueryNumber, useQueryString } from 'src/utils/useQueryId';
import { QuestionStatus } from 'types/models/question.type';

export const AlertModal: React.FunctionComponent = () => {
    const { t } = useTranslation();

    const [showModal, setShowModal] = React.useState(false);
    const [modalTitle, setModalTitle] = React.useState('');
    const [modalContent, setModalContent] = React.useState('');
    const [hasConfirmButton, setHasConfirmButton] = React.useState(false);
    const [route, setRoute] = React.useState('');
    const router = useRouter();

    // retrieve query params
    const alert: string | undefined = useQueryString('alert');
    const sequency: number | undefined = useQueryNumber('sequency');
    const type: string | undefined = useQueryString('type');
    const status: number | undefined = useQueryNumber('status');
    const projectId: string | undefined = useQueryString('projectId');

    React.useEffect(() => {
        if (alert !== undefined && alert === 'teacher' && sequency !== undefined && projectId !== undefined && status !== undefined) {
            setModalForTeacher();
        } else if (alert !== undefined && alert == 'student' && type !== undefined) {
            setModalForStudent();
        }

        return;
    }, [alert]);

    const setModalForStudent = () => {
        const isFeedback = type === 'feedback';
        setModalTitle(t(`collaboration_alert_modal_student_title_${isFeedback ? 'feedback' : 'ok'}`));
        setModalContent(t(`collaboration_alert_modal_student_content_${isFeedback ? 'feedback' : 'ok'}`));
        setShowModal(true);
    };

    const setModalForTeacher = () => {
        setModalTitle(t('collaboration_alert_modal_teacher_title'));

        if (sequency !== undefined) {
            setModalContent(t('collaboration_alert_modal_teacher_content', { color: COLORS[sequency], sequency: sequency + 1 }));
        } else {
            setModalContent(t('collaboration_alert_modal_teacher_content_empty'));
        }

        setHasConfirmButton(true);
        setRoute(
            status === QuestionStatus.STORYBOARD
                ? `/create/3-storyboard?projectId=${projectId}`
                : `/create/4-pre-mounting/edit?question=${sequency}&projectId=${projectId}`,
        );
        setShowModal(true);
    };

    const closeModal = (goToPage: boolean = false) => {
        if (goToPage && route) {
            router.push(route);
        } else {
            delete router.query.alert;
            delete router.query.sequency;
            delete router.query.type;
            delete router.query.status;
            router.push(router);
        }

        setModalContent('');
        setModalTitle('');
        setHasConfirmButton(false);
        setRoute('');
        setShowModal(false);
    };

    const modalProps: ModalProps = {
        isOpen: showModal,
        onClose: () => closeModal(),
        onConfirm: hasConfirmButton ? () => closeModal(true) : undefined,
        title: modalTitle,
        cancelLabel: t('close'),
        confirmLabel: t('see'),
    };

    return (
        <Modal {...modalProps}>
            <div dangerouslySetInnerHTML={{ __html: modalContent }}></div>
        </Modal>
    );
};
