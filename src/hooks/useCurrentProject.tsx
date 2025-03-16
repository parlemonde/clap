'use client';

import React from 'react';
import useSWR from 'swr';

import { useLocalStorage } from './useLocalStorage';
import type { LocalProject } from './useLocalStorage/local-storage';
import { useWebsockets } from './useWebsockets';
import { logout } from 'src/actions/authentication/logout';
import { endCollaboration } from 'src/actions/projects/end-collaboration';
import { startCollaboration } from 'src/actions/projects/start-collaboration';
import { updateProject } from 'src/actions/projects/update-project';
import { Button } from 'src/components/layout/Button';
import { Flex } from 'src/components/layout/Flex';
import { Text } from 'src/components/layout/Typography';
import { sendToast } from 'src/components/ui/Toasts';
import type { Project } from 'src/database/schemas/projects';
import { jsonFetcher } from 'src/lib/json-fetcher';

interface UseCurrentProjectData {
    project?: LocalProject;
    setProject: (newProject: LocalProject) => void;
    collaborationButton: React.ReactNode;
    isCollaborationEnabled: boolean;
}

export const useCurrentProject = (): UseCurrentProjectData => {
    const [projectId] = useLocalStorage('projectId');
    const [localProject, setLocalProject] = useLocalStorage('project');

    // Fetch project from backend
    const { data, mutate } = useSWR<Project>(projectId !== undefined ? `/api/projects/${projectId}` : null, jsonFetcher);

    // Collaboration on the project
    const isCollaborationAvailable = process.env.NEXT_PUBLIC_COLLABORATION_SERVER_URL !== undefined && projectId !== undefined;
    const collaborationCode =
        data && data.collaborationCodeExpiresAt !== null && new Date(data.collaborationCodeExpiresAt).getTime() > new Date().getTime()
            ? data.collaborationCode || undefined
            : undefined;
    const isCollaborationEnabled = isCollaborationAvailable && collaborationCode !== undefined;
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
            if (msg === 'end_collaboration') {
                logout('/login').catch(console.error);
            }
        },
    });
    const [isCollaborationLoading, setIsCollaborationLoading] = React.useState(false);
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
        socket?.send('end_collaboration');
        await endCollaboration(projectId);
        await mutate();
    };
    const collaborationButton = isCollaborationAvailable ? (
        <Flex flexDirection="row" alignItems="center">
            <Button
                marginRight="lg"
                variant="contained"
                color="secondary"
                label={collaborationCode ? 'Stopper la collaboration' : 'Démarrer la collaboration'}
                isUpperCase={false}
                isLoading={isCollaborationLoading}
                onClick={async () => {
                    setIsCollaborationLoading(true);
                    if (collaborationCode) {
                        await onStopCollaboration();
                    } else {
                        await onStartCollaboration();
                    }
                    setIsCollaborationLoading(false);
                }}
            ></Button>
            {collaborationCode && <Text>Code de collaboration: {collaborationCode}</Text>}
        </Flex>
    ) : null;

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
        collaborationButton,
        isCollaborationEnabled,
    };
};
