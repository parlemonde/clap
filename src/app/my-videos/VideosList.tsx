'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

import { ProjectCard } from './ProjectCard';
import { useTranslation } from 'src/contexts/translationContext';
import type { Project } from 'src/database/schemas/projects';
import { useLocalStorage } from 'src/hooks/useLocalStorage';
import { deleteFromLocalStorage } from 'src/hooks/useLocalStorage/local-storage';

interface VideoListProps {
    projects: Project[];
}

export const VideoList = ({ projects }: VideoListProps) => {
    const [, setProjectId] = useLocalStorage('projectId');
    const { t } = useTranslation();
    const router = useRouter();

    const handleWipProjectClickEdit = (projectId: number) => () => {
        router.push(`/my-videos/${projectId}`);
    };

    return (
        <div className="wip-videos">
            {projects.length > 0 ? (
                <React.Fragment>
                    {projects.map((p) => (
                        <ProjectCard
                            key={p.id}
                            title={p.name}
                            themeName={p.themeName}
                            onClick={() => {
                                deleteFromLocalStorage('project');
                                setProjectId(p.id);
                                router.push(`/create/3-storyboard`);
                            }}
                            onClickEdit={handleWipProjectClickEdit(p.id)}
                        />
                    ))}
                </React.Fragment>
            ) : (
                <ProjectCard
                    title={t('my_videos_empty')}
                    onClick={() => {
                        router.push('/');
                    }}
                />
            )}
        </div>
    );
};
