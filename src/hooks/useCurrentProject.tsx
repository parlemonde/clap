'use client';

import React from 'react';
import useSWR from 'swr';

import { onSendCurrentProjectUpdateMsg } from './useCollaboration';
import { useLocalStorage } from './useLocalStorage';
import type { LocalProject } from './useLocalStorage/local-storage';
import { updateProject } from 'src/actions/projects/update-project';
import { userContext } from 'src/contexts/userContext';
import type { Project } from 'src/database/schemas/projects';
import { jsonFetcher } from 'src/lib/json-fetcher';

interface UseCurrentProjectData {
    project?: LocalProject;
    setProject: (newProject: LocalProject) => void;
}

export const useCurrentProject = (): UseCurrentProjectData => {
    const { user } = React.useContext(userContext);
    const [localProjectId] = useLocalStorage('projectId');
    const projectId = user !== undefined ? localProjectId : undefined; // If user is not logged in, do not try to fetch last current project
    const [localProject, setLocalProject] = useLocalStorage('project');

    // Fetch project from backend
    const { data, mutate } = useSWR<Project>(projectId !== undefined ? `/api/projects/${projectId}` : null, jsonFetcher);

    // Update project
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
                            collaborationCode: data?.collaborationCode ?? null,
                            collaborationCodeExpiresAt: data?.collaborationCodeExpiresAt ?? null,
                        },
                    },
                )
                    .catch((error) => {
                        console.error(error);
                    })
                    .finally(() => {
                        onSendCurrentProjectUpdateMsg();
                    });
            } else {
                setLocalProject(newProject);
            }
        },
        [
            projectId,
            mutate,
            data?.userId,
            data?.createDate,
            data?.updateDate,
            data?.videoJobId,
            data?.collaborationCode,
            data?.collaborationCodeExpiresAt,
            setLocalProject,
        ],
    );

    return {
        project: projectId !== undefined ? data : localProject,
        setProject,
    };
};
