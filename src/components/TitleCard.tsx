import Link from 'next/link';
import React from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';

import { useResizeObserver } from 'src/hooks/useResizeObserver';
import { useTranslation } from 'src/i18n/useTranslation';
import type { Title } from 'types/models/title.type';

interface TitleCardProps {
    questionIndex: number;
    title?: Title | null;
    onDelete?(): void;
}

export const TitleCard = ({ questionIndex, title, onDelete = () => {} }: TitleCardProps) => {
    const { t } = useTranslation();
    const style = React.useMemo(() => {
        if (!title || title.style === '') {
            return null;
        }
        try {
            return JSON.parse(title.style);
        } catch (err) {
            return null;
        }
    }, [title]);
    const [canvasRef, { height: canvasHeight }] = useResizeObserver<HTMLDivElement>();

    return (
        <div className="plan-button-container">
            <Link href={`/create/3-storyboard/title?question=${questionIndex}`} passHref>
                <ButtonBase component="a" style={{ width: '100%', height: '100%' }}>
                    <div className="plan title-card" ref={canvasRef}>
                        {title ? (
                            <p
                                className="title-card-text"
                                style={
                                    style === null
                                        ? {}
                                        : {
                                              fontSize: `${((style.fontSize || 8) * canvasHeight) / 100}px`,
                                              lineHeight: `${((style.fontSize || 8) * canvasHeight) / 100}px`,
                                              fontFamily: style.fontFamily || 'serif',
                                              left: `${style.x ?? 15}%`,
                                              top: `${style.y ?? 30}%`,
                                              width: `${style.width ?? 70}%`,
                                          }
                                }
                            >
                                {title.text}
                            </p>
                        ) : (
                            <p className="title-card-placeholder">
                                T <span>Ajouter un titre</span>
                            </p>
                        )}
                        {title && (
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
                                        onClick={(event) => {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            onDelete();
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </div>
                            </>
                        )}
                    </div>
                </ButtonBase>
            </Link>
        </div>
    );
};
