import React from 'react';
import useSWR from 'swr';

import { useLocalStorage } from './useLocalStorage';
import type { LocalProject } from './useLocalStorage/local-storage';
import { updateProject } from 'src/actions/projects/update-project';
import type { Project } from 'src/database/schemas/projects';
import { jsonFetcher } from 'src/lib/json-fetcher';

export const useCurrentProject = (): [LocalProject | undefined, (newProject: LocalProject) => void] => {
    const [projectId] = useLocalStorage('projectId');
    const [localProject, setLocalProject] = useLocalStorage('project');

    // Fetch project from backend
    const { data, mutate } = useSWR<Project>(projectId !== undefined ? `/api/projects/${projectId}` : null, jsonFetcher);

    const setProject = React.useCallback(
        (newProject: LocalProject) => {
            if (projectId !== undefined) {
                mutate(
                    async () => {
                        await updateProject(projectId, {
                            ...newProject,
                            themeId: typeof newProject.themeId === 'string' ? null : newProject.themeId,
                            scenarioId: typeof newProject.scenarioId === 'string' ? null : newProject.scenarioId,
                        });
                        return jsonFetcher<Project>(`/api/projects/${projectId}`);
                    },
                    {
                        optimisticData: {
                            ...newProject,
                            id: projectId,
                            userId: data?.userId ?? 0,
                            createDate: data?.createDate ?? '',
                            updateDate: data?.updateDate ?? '',
                            deleteDate: null,
                            videoJobId: data?.videoJobId || '',
                            themeId: typeof newProject.themeId === 'string' ? null : newProject.themeId,
                            scenarioId: typeof newProject.scenarioId === 'string' ? null : newProject.scenarioId,
                        },
                    },
                ).catch((error) => {
                    console.error(error);
                });
            } else {
                setLocalProject(newProject);
            }
        },
        [projectId, mutate, data?.userId, data?.createDate, data?.updateDate, data?.videoJobId, setLocalProject],
    );

    return [projectId !== undefined ? data : localProject, setProject];
};
