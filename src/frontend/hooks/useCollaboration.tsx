import React from 'react';
import useSWR from 'swr';

import type { VerifyAlertData } from '@frontend/components/collaboration/AlertModal';
import { sendCollaborationVerifyAlert } from '@frontend/components/collaboration/AlertModal';
import { Button } from '@frontend/components/layout/Button';
import { Flex } from '@frontend/components/layout/Flex';
import { Text } from '@frontend/components/layout/Typography';
import { sendToast } from '@frontend/components/ui/Toasts';
import { userContext } from '@frontend/contexts/userContext';
import { authClient } from '@frontend/lib/auth-client';
import { jsonFetcher } from '@lib/json-fetcher';
import type { Project } from '@server/database/schemas/projects';
import { endCollaboration } from '@server-actions/projects/end-collaboration';
import { startCollaboration } from '@server-actions/projects/start-collaboration';

import { useLocalStorage } from './useLocalStorage';
import { deleteFromLocalStorage } from './useLocalStorage/local-storage';
import { useWebsockets } from './useWebsockets';

export const onSendCurrentProjectUpdateMsg = () => {
    document.dispatchEvent(new CustomEvent('update_project'));
};

export const useCollaboration = () => {
    const user = React.useContext(userContext);
    const [localProjectId] = useLocalStorage('projectId');
    const projectId = user?.role === 'student' ? user.projectId : localProjectId;
    const { data, mutate } = useSWR<Project>(projectId !== undefined ? `/api/projects/${projectId}` : null, jsonFetcher);
    const { data: collaborationUrlData } = useSWR<{ url: string; protocols: string[] }>(
        projectId !== undefined ? `/api/projects/${projectId}/get-collaboration-url` : null,
        jsonFetcher,
        {
            revalidateIfStale: false,
            revalidateOnFocus: false,
        },
    );
    const collaborationUrl = collaborationUrlData?.url;

    const isCollaborationAvailable = projectId !== undefined;
    const collaborationCode =
        data && data.collaborationCodeExpiresAt !== null && new Date(data.collaborationCodeExpiresAt).getTime() > new Date().getTime()
            ? data.collaborationCode || undefined
            : undefined;

    const isCollaborationEnabled = Boolean(collaborationUrl) && isCollaborationAvailable && collaborationCode !== undefined;
    const socket = useWebsockets({
        url: collaborationUrl || '',
        protocols: collaborationUrlData?.protocols || [],
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
                if (user?.role === 'student') {
                    deleteFromLocalStorage('project');
                    deleteFromLocalStorage('projectId');
                    authClient
                        .signOut()
                        .catch(console.error)
                        .finally(() => {
                            window.location.assign('/join');
                        });
                }
            }
            if (msg.startsWith('validate_question:')) {
                const data = JSON.parse(msg.slice('validate_question:'.length)) as VerifyAlertData;
                sendCollaborationVerifyAlert(data);
            }
        },
    });
    React.useEffect(() => {
        const onSendMsg = () => {
            socket?.send('update_project');
        };
        document.addEventListener('update_project', onSendMsg);
        return () => {
            document.removeEventListener('update_project', onSendMsg);
        };
    }, [socket]);
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
    const sendCollaborationValidationMsg = (data: VerifyAlertData) => {
        socket?.send(`validate_question:${JSON.stringify(data)}`);
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

    return {
        collaborationButton,
        isCollaborationEnabled,
        sendCollaborationValidationMsg,
    };
};
