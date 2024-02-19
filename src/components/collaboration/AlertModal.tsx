import { useRouter } from 'next/router';
import React from 'react';

import { Modal } from '../layout/Modal';
import useQuery from 'src/hooks/useQuery';
import { useTranslation } from 'src/i18n/useTranslation';
import { COLORS } from 'src/utils/colors';
import { QuestionStatus } from 'types/models/question.type';

export const AlertModal: React.FunctionComponent = () => {
    const { t } = useTranslation();

    const [showModal, setShowModal] = React.useState(false);
    const [modalTitle, setModalTitle] = React.useState('');
    const [modalContent, setModalContent] = React.useState('');
    const [hasConfirmButton, setHasConfirmButton] = React.useState(false);
    const [route, setRoute] = React.useState(null);
    const router = useRouter();

    const query = useQuery();

    React.useEffect(() => {
        if (!query) return;
        setModal(query);
    }, [query]);

    const setModal = ({ alert, sequency, type, status, projectId }) => {
        if (alert && alert === 'teacher') {
            setModalTitle(t('collaboration_alert_modal_teacher_title'));
            if (sequency) {
                setModalContent(t('collaboration_alert_modal_teacher_content', { color: COLORS[sequency], sequency: parseInt(sequency) + 1 }));
            } else {
                setModalContent(t('collaboration_alert_modal_teacher_content_empty'));
            }

            if (sequency && projectId && status && [QuestionStatus.STORYBOARD, QuestionStatus.SUBMITTED].includes(parseInt(status))) {
                setHasConfirmButton(true);
                setRoute(
                    parseInt(status) === QuestionStatus.STORYBOARD
                        ? `/create/3-storyboard?projectId=${projectId}`
                        : `/create/4-pre-mounting/edit?question=${sequency}&projectId=${projectId}`,
                );
            }
            setShowModal(true);
        } else if (alert && alert === 'student') {
            const isFeedback = type === 'feedback';
            setModalTitle(t(`collaboration_alert_modal_student_title_${isFeedback ? 'feedback' : 'ok'}`));
            setModalContent(t(`collaboration_alert_modal_student_content_${isFeedback ? 'feedback' : 'ok'}`));
            setShowModal(true);
        }
    };

    const closeModal = (goToPage: boolean = false) => {
        if (goToPage) {
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
        setRoute(null);
        setShowModal(false);
    };

    const modalProps = {
        isOpen: showModal,
        onClose: () => closeModal(),
        onConfirm: hasConfirmButton ? () => closeModal(true) : null,
        title: modalTitle,
        cancelLabel: t('close'),
        confirmLabel: t('see'),
        ariaLabelledBy: '',
        ariaDescribedBy: '',
    };

    return (
        <Modal {...modalProps}>
            <div dangerouslySetInnerHTML={{ __html: modalContent }}></div>
        </Modal>
    );
};
