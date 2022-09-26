import { useRouter } from 'next/router';
import React from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';

import { useTranslation } from 'src/i18n/useTranslation';
import { ProjectServiceContext } from 'src/services/useProject';
import { getQuestions } from 'src/util';

interface TitleCardProps {
    questionIndex: number;
    handleDelete?(event: React.MouseEvent): void;
    addTitle?(event: React.MouseEvent): void;
}

export const TitleCard: React.FunctionComponent<TitleCardProps> = ({
    questionIndex,
    handleDelete = () => {},
    addTitle = () => {},
}: TitleCardProps) => {
    const { t } = useTranslation();
    const router = useRouter();
    const buttonStyle: React.CSSProperties = { width: '100%' };
    const { project } = React.useContext(ProjectServiceContext);
    const questions = getQuestions(project);
    const question = questionIndex !== -1 ? questions[questionIndex] || null : null;
    const style = question === null || question.title == null || question.title.style === '' ? null : JSON.parse(question.title.style);

    return (
        <div className="plan-button-container">
            <ButtonBase component="a" onClick={addTitle} style={buttonStyle}>
                <div className="plan title-card">
                    {question !== null && question.title == null ? (
                        <p className="title-card-placeholder">
                            T <span>Ajouter un titre</span>
                        </p>
                    ) : (
                        <p
                            className="title-card-text"
                            style={
                                style == null
                                    ? {}
                                    : {
                                          fontFamily: style.fontFamily,
                                          left: `${style.left}%`,
                                          top: `${style.top}%`,
                                      }
                            }
                        >
                            {question?.title?.text}
                        </p>
                    )}
                    {question !== null && question.title == null ? null : (
                        <>
                            <div className="edit">{t('edit')}</div>
                            <div className="delete">
                                <IconButton
                                    sx={{
                                        backgroundColor: (theme) => theme.palette.error.main,
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: (theme) => theme.palette.error.light,
                                        },
                                    }}
                                    aria-label={t('delete')}
                                    size="small"
                                    onClick={handleDelete}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </div>
                        </>
                    )}
                </div>
            </ButtonBase>
        </div>
    );
};
