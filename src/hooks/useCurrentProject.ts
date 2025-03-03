'use client';

import React from 'react';
import useSWR from 'swr';

import { useLocalStorage } from './useLocalStorage';
import type { LocalProject } from './useLocalStorage/local-storage';
import { useSessionStorage } from './useSessionStorage';
import { deleteFromSessionStorage } from './useSessionStorage/session-storage';
import { useWebsockets } from './useWebsockets';
import { updateProject } from 'src/actions/projects/update-project';
import type { Project } from 'src/database/schemas/projects';
import { jsonFetcher } from 'src/lib/json-fetcher';

interface UseCurrentProjectData {
    project?: LocalProject;
    setProject: (newProject: LocalProject) => void;
    collaborationCode?: number;
    onStartCollaboration: () => boolean;
    onStopCollaboration: () => void;
}

export const useCurrentProject = (): UseCurrentProjectData => {
    const [projectId] = useLocalStorage('projectId');
    const [localProject, setLocalProject] = useLocalStorage('project');

    // Fetch project from backend
    const { data, mutate } = useSWR<Project>(projectId !== undefined ? `/api/projects/${projectId}` : null, jsonFetcher);

    // Collaboration on the project
    const [collaborationCode, setCollaborationCode] = useSessionStorage('collaborationCode');
    const isCollaborationEnabled = projectId !== undefined && collaborationCode !== undefined;
    const socket = useWebsockets(projectId ? `clap_project_${projectId}` : '', isCollaborationEnabled, (msg) => {
        if (!projectId) {
            return; // Needs a project
        }
        if (msg === 'update_project') {
            mutate().catch(console.error);
        }
    });
    const onStartCollaboration = () => {
        if (projectId === undefined) {
            return false;
        }
        const newCode = Math.floor(Math.random() * 1000000); // TODO: generate on backend
        setCollaborationCode(newCode);
        return true;
    };
    const onStopCollaboration = () => {
        if (projectId === undefined) {
            return;
        }
        deleteFromSessionStorage('collaborationCode');
    };

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
                        },
                    },
                )
                    .catch((error) => {
                        console.error(error);
                    })
                    .finally(() => {
                        socket?.send('update_project');
                    });
            } else {
                setLocalProject(newProject);
            }
        },
        [projectId, mutate, data?.userId, data?.createDate, data?.updateDate, data?.videoJobId, setLocalProject, socket],
    );

    return {
        project: projectId !== undefined ? data : localProject,
        setProject,
        collaborationCode,
        onStartCollaboration,
        onStopCollaboration,
    };
};
