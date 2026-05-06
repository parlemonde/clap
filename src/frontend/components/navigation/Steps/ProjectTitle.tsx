'use client';

import { Pencil1Icon } from '@radix-ui/react-icons';
import { useExtracted } from 'next-intl';
import React from 'react';

import { IconButton } from '@frontend/components/layout/Button/IconButton';
import { Title } from '@frontend/components/layout/Typography';
import { useCurrentProject } from '@frontend/hooks/useCurrentProject';
import { useLocalStorage } from '@frontend/hooks/useLocalStorage';

export const ProjectTitle = () => {
    const [projectId] = useLocalStorage('projectId');
    const { projectData, name } = useCurrentProject();

    const t = useExtracted('ProjectTitle');
    if (!projectData || !projectId || !name) {
        return null;
    }
    return (
        <div className="text-center">
            <Title
                color="primary"
                variant="h2"
                style={{
                    display: 'inline',
                    fontSize: '1.5rem',
                }}
                marginRight="sm"
            >
                {t('Projet :')}
            </Title>
            <Title
                color="inherit"
                variant="h2"
                style={{
                    display: 'inline',
                    marginLeft: '0.5rem',
                    fontSize: '1.5rem',
                }}
            >
                {name}
            </Title>
            <IconButton
                as="a"
                href={`/my-videos/${projectId}`}
                aria-label="edit"
                size="sm"
                color="primary"
                icon={Pencil1Icon}
                style={{ marginLeft: '0.6rem', marginTop: '-0.3rem' }}
            ></IconButton>
        </div>
    );
};
