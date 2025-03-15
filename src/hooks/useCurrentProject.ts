'use client';

import React from 'react';
import useSWR from 'swr';

import { useLocalStorage } from './useLocalStorage';
import type { LocalProject } from './useLocalStorage/local-storage';
import { useWebsockets } from './useWebsockets';
import { endCollaboration } from 'src/actions/projects/end-collaboration';
import { startCollaboration } from 'src/actions/projects/start-collaboration';
import { updateProject } from 'src/actions/projects/update-project';
import { sendToast } from 'src/components/ui/Toasts';
import type { Project } from 'src/database/schemas/projects';
import { jsonFetcher } from 'src/lib/json-fetcher';

interface UseCurrentProjectData {
    project?: LocalProject;
    setProject: (newProject: LocalProject) => void;
    isCollaborationAvailable: boolean;
    collaborationCode?: string;
    onStartCollaboration: () => Promise<void>;
    onStopCollaboration: () => Promise<void>;
}

export const useCurrentProject = (): UseCurrentProjectData => {
    const [projectId] = useLocalStorage('projectId');
    const [localProject, setLocalProject] = useLocalStorage('project');

    // Fetch project from backend
    const { data, mutate } = useSWR<Project>(projectId !== undefined ? `/api/projects/${projectId}` : null, jsonFetcher);

    // Collaboration on the project
    const isCollaborationAvailable = process.env.NEXT_PUBLIC_COLLABORATION_SERVER_URL !== undefined;
    const collaborationCode =
        data && data.collaborationCodeExpiresAt !== null && new Date(data.collaborationCodeExpiresAt).getTime() > new Date().getTime()
            ? data.collaborationCode || undefined
            : undefined;
    const isCollaborationEnabled = isCollaborationAvailable && projectId !== undefined && collaborationCode !== undefined;
    const socket = useWebsockets({
        room: projectId ? `clap_project_${projectId}` : '',
        isEnabled: isCollaborationEnabled,
        onSocketError: React.useCallback(() => {
            if (projectId) {
                endCollaboration(projectId).catch(console.error);
            }
            sendToast({
                message: 'Failed to connect to collaboration server',
                type: 'error',
            });
        }, [projectId]),
        onReceiveMsg: (msg) => {
            if (!projectId) {
                return; // Needs a project
            }
            if (msg === 'update_project') {
                mutate().catch(console.error);
            }
        },
    });
    const onStartCollaboration = async () => {
        if (projectId === undefined) {
            return;
        }
        await startCollaboration(projectId);
        await mutate();
    };
    const onStopCollaboration = async () => {
        if (projectId === undefined) {
            return;
        }
        await endCollaboration(projectId);
        await mutate();
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
                            collaborationCode: data?.collaborationCode ?? null,
                            collaborationCodeExpiresAt: data?.collaborationCodeExpiresAt ?? null,
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
            socket,
        ],
    );

    return {
        project: projectId !== undefined ? data : localProject,
        setProject,
        isCollaborationAvailable,
        collaborationCode,
        onStartCollaboration,
        onStopCollaboration,
    };
};
