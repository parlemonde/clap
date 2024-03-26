import { useRouter } from 'next/router';
import React from 'react';

import { useProjects } from 'src/api/projects/projects.list';
import { ProjectCard } from 'src/components/create/ProjectCard';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';
import { useTranslation } from 'src/i18n/useTranslation';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';

const VideosPage = () => {
    const { t, currentLocale } = useTranslation();
    const router = useRouter();
    const { projects } = useProjects({ include: 'theme' });

    const handleWipProjectClickEdit = (projectId: number) => () => {
        router.push(`/my-videos/${projectId}`);
    };

    return (
        <Container>
            <Title color="primary" variant="h1" marginY="md">
                <Trans i18nKey="my_videos_title">
                    Mes <Inverted>supers</Inverted> vidéos
                </Trans>
            </Title>
            <div className="wip-videos">
                {projects.length > 0 ? (
                    <React.Fragment>
                        {projects.map((p) => (
                            <ProjectCard
                                key={p.id}
                                title={p.title || ''}
                                themeName={p.theme?.names?.[currentLocale] || p.theme?.names?.fr || ''}
                                href={`/create/2-questions${serializeToQueryUrl({ projectId: p.id || null })}`}
                                onClickEdit={handleWipProjectClickEdit(p.id)}
                            />
                        ))}
                    </React.Fragment>
                ) : (
                    <ProjectCard title={t('my_videos_empty')} href="/create" />
                )}
            </div>
        </Container>
    );
};

export default VideosPage;
