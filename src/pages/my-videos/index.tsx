import { useRouter } from 'next/router';
import React from 'react';

import Typography from '@mui/material/Typography';

import { useProjects } from 'src/api/projects/projects.list';
import { ProjectCard } from 'src/components/ProjectCard';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';
import { useTranslation } from 'src/i18n/useTranslation';

const VideosPage = () => {
    const { t, currentLocale } = useTranslation();
    const router = useRouter();
    const { projects } = useProjects({ include: 'theme' });

    const handleWipProjectClick = (projectId: number) => (event: React.MouseEvent) => {
        event.preventDefault();
        router.push(`/create/3-storyboard?projectId=${projectId}`);
    };

    const handleWipProjectClickEdit = (projectId: number) => () => {
        router.push(`/my-videos/${projectId}`);
    };

    const handleNewProjectClick = (event: React.MouseEvent) => {
        event.preventDefault();
        router.push('/create');
    };

    return (
        <div>
            <Typography color="primary" variant="h1">
                <Trans i18nKey="my_videos_title">
                    Mes <Inverted>supers</Inverted> vidéos
                </Trans>
            </Typography>
            <div className="wip-videos">
                {projects.length > 0 ? (
                    <React.Fragment>
                        {projects.map((p) => (
                            <ProjectCard
                                key={p.id}
                                title={p.title || ''}
                                themeName={p.theme?.names?.[currentLocale] || p.theme?.names?.fr || ''}
                                onClick={handleWipProjectClick(p.id)}
                                onClickEdit={handleWipProjectClickEdit(p.id)}
                            />
                        ))}
                    </React.Fragment>
                ) : (
                    <ProjectCard title={t('my_videos_empty')} onClick={handleNewProjectClick} />
                )}
            </div>
        </div>
    );
};

export default VideosPage;
