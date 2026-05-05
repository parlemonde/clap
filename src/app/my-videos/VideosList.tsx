'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
    const t = useTranslations();
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
                    title={t('my_videos_page.empty_list.title')}
                    onClick={() => {
                        router.push('/');
                    }}
                />
            )}
        </div>
    );
};
