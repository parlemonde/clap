import { useRouter } from 'next/router';
import React from 'react';

import { Modal } from '../layout/Modal';
import type { ModalProps } from '../layout/Modal/Modal';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { useTranslation } from 'src/i18n/useTranslation';
import { COLORS } from 'src/utils/colors';
import { useQueryNumber, useQueryString } from 'src/utils/useQueryId';
import type { Question } from 'types/models/question.type';
import { QuestionStatus } from 'types/models/question.type';

export const AlertModal: React.FunctionComponent = () => {
    const { t } = useTranslation();

    const { project } = useCurrentProject();

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

    React.useEffect(() => {
        if (alert !== undefined && alert === 'teacher' && sequency !== undefined && status !== undefined) {
            setModalForTeacher();
        } else if (alert !== undefined && alert == 'student' && type !== undefined) {
            setModalForStudent();
        }

        return;
    }, [alert]);

    const setModalForStudent = () => {
        const isFeedback = type === 'feedback';
        if (isFeedback) {
            setModalTitle(t('collaboration_alert_modal_student_title_feedback'));
            setModalContent(t('collaboration_alert_modal_student_content_feedback'));
        } else {
            setModalTitle(t('collaboration_alert_modal_student_title_ok'));

            let status = 'storyboard';
            if (project !== undefined && sequency !== undefined && project.questions !== undefined) {
                const questions: Question[] = project.questions;
                const question: Question | undefined = questions.find((q) => q.index === sequency);
                if (question !== undefined) {
                    status = question.status !== undefined && question.status < QuestionStatus.SUBMITTED ? 'storyboard' : 'premounting';
                }
            }
            setModalContent(t(`collaboration_alert_modal_student_content_${status}`));
        }
        setShowModal(true);
    };

    const setModalForTeacher = () => {
        setModalTitle(t('collaboration_alert_modal_teacher_title'));

        const status =
            project !== undefined && sequency !== undefined && project.questions !== undefined
                ? project?.questions[sequency]?.status || QuestionStatus.STORYBOARD
                : QuestionStatus.STORYBOARD;

        if (sequency !== undefined) {
            setModalContent(
                t('collaboration_alert_modal_teacher_content', {
                    color: COLORS[sequency],
                    sequency: sequency + 1,
                    step: t(`step${status === QuestionStatus.STORYBOARD ? 3 : 4}`),
                }),
            );
        } else {
            setModalContent(t('collaboration_alert_modal_teacher_content_empty'));
        }

        setHasConfirmButton(true);
        setRoute(
            status === QuestionStatus.STORYBOARD
                ? `/create/3-storyboard?projectId=${project?.id || 0}`
                : `/create/4-pre-mounting/edit?question=${sequency}&projectId=${project?.id || 0}`,
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
