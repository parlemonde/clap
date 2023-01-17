import Link from 'next/link';
import React, { useContext } from 'react';

import EditIcon from '@mui/icons-material/Edit';
import { Typography, IconButton } from '@mui/material';

import { projectContext } from 'src/contexts/projectContext';
import { useTranslation } from 'src/i18n/useTranslation';

type ProjectTitleProp = {
    smaller?: boolean;
    onClick?(event: React.MouseEvent): void;
};

export const ProjectTitle = ({ smaller = false, onClick = () => {} }: ProjectTitleProp) => {
    const { t } = useTranslation();
    const { project } = useContext(projectContext);

    if (!project || project.id === null || project.id === 0) {
        return null;
    }

    return (
        <div className="text-center">
            <Typography
                color="primary"
                variant="h2"
                style={{
                    display: 'inline',
                    fontSize: smaller ? '1.2rem' : '1.5rem',
                }}
            >
                {t('project')}
            </Typography>
            <Typography
                color="inherit"
                variant="h2"
                style={{
                    display: 'inline',
                    marginLeft: '0.5rem',
                    fontSize: smaller ? '1.2rem' : '1.5rem',
                }}
            >
                {project.title}
            </Typography>
            <Link href={`/my-videos/${project.id}`} passHref>
                <IconButton
                    component="a"
                    sx={{ border: '1px solid', borderColor: (theme) => theme.palette.primary.main }}
                    aria-label="edit"
                    size="small"
                    color="primary"
                    style={{ marginLeft: '0.6rem', marginTop: '-0.3rem' }}
                    onClick={onClick}
                >
                    <EditIcon />
                </IconButton>
            </Link>
        </div>
    );
};
