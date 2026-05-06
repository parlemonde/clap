'use client';

import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import React from 'react';

import { useLocalStorage } from '@frontend/hooks/useLocalStorage';
import { deleteFromLocalStorage } from '@frontend/hooks/useLocalStorage/local-storage';
import type { Project } from '@server/database/schemas/projects';

import { ProjectCard } from './ProjectCard';

interface VideoListProps {
    projects: Project[];
}

export const VideoList = ({ projects }: VideoListProps) => {
    const [, setProjectId] = useLocalStorage('projectId');
    const t = useExtracted('my-videos.VideosList');
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
                            themeName={p.data.themeName}
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
                    title={t("Vous n'avez pas encore de projet en cours. En créer un ?")}
                    onClick={() => {
                        router.push('/');
                    }}
                />
            )}
        </div>
    );
};
