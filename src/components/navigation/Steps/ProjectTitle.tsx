'use client';

import { Pencil1Icon } from '@radix-ui/react-icons';
import Link from 'next/link';
import React from 'react';

import { IconButton } from 'src/components/layout/Button/IconButton';
import { Title } from 'src/components/layout/Typography';
import { useTranslation } from 'src/contexts/translationContext';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { useLocalStorage } from 'src/hooks/useLocalStorage';

export const ProjectTitle = () => {
    const [projectId] = useLocalStorage('projectId');
    const [project] = useCurrentProject();

    const { t } = useTranslation();
    if (!project || !projectId) {
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
                {t('project')}
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
                {project.name}
            </Title>
            <Link href={`/my-videos/${projectId}`} passHref legacyBehavior>
                <IconButton
                    as="a"
                    aria-label="edit"
                    size="sm"
                    color="primary"
                    icon={Pencil1Icon}
                    style={{ marginLeft: '0.6rem', marginTop: '-0.3rem' }}
                ></IconButton>
            </Link>
        </div>
    );
};
