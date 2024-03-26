import React from 'react';

import { Field } from '../layout/Form';
import { Select } from '../layout/Form/Select';
import { Modal } from '../layout/Modal';
import { useTranslation } from 'src/i18n/useTranslation';
import { QuestionStatus, type Question } from 'types/models/question.type';

type onConfirmData = {
    question: Question;
    status?: QuestionStatus;
};

interface StatusModalProps {
    question: Question;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: onConfirmData) => void;
}

export const StatusModal: React.FunctionComponent<StatusModalProps> = ({ question, isOpen, onClose, onConfirm }: StatusModalProps) => {
    const { t } = useTranslation();

    const [selectedStatus, setSelectedStatus] = React.useState(question.status);
    const options = Object.values(QuestionStatus).filter((status) => !isNaN(Number(status)));

    React.useEffect(() => {
        if (question) {
            setSelectedStatus(question.status);
        }
    }, [question]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={() => {
                onConfirm({ question, status: selectedStatus });
                onClose();
            }}
            title={t('sequency_status_modal_title')}
            cancelLabel={t('close')}
            confirmLabel={t('validate')}
        >
            <Field
                name="sequency-status"
                label={t('sequency_status_label') + ' :'}
                input={
                    <Select
                        name="sequency-status-select"
                        id="sequency-status-select"
                        value={selectedStatus}
                        onChange={(event) => {
                            setSelectedStatus(parseInt(event.target.value, 10));
                        }}
                    >
                        {options.map((status, index) => (
                            <option value={status} key={index}>
                                {t(`sequency_status_${status}`)}
                            </option>
                        ))}
                    </Select>
                }
            ></Field>
        </Modal>
    );
};
