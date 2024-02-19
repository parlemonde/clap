import React from 'react';

import { Button } from '../layout/Button';
import { useTranslation } from 'src/i18n/useTranslation';

interface ButtonShowFeedbackProps {
    onClick: () => void;
}

export const ButtonShowFeedback: React.FunctionComponent<ButtonShowFeedbackProps> = ({ onClick }: ButtonShowFeedbackProps) => {
    const { t } = useTranslation();

    return (
        <Button
            component="a"
            variant="contained"
            color="secondary"
            style={{
                textTransform: 'none',
                marginLeft: '2rem',
            }}
            onClick={onClick}
            label={t('collaboration_show_feedback')}
        ></Button>
    );
};
