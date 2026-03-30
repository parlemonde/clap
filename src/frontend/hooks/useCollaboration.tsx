import React from 'react';
import { logout } from 'src/actions/authentication/logout';
import { jsonFetcher } from 'src/lib/json-fetcher';
import useSWR from 'swr';

import type { VerifyAlertData } from '@frontend/components/collaboration/AlertModal';
import { sendCollaborationVerifyAlert } from '@frontend/components/collaboration/AlertModal';
import { Button } from '@frontend/components/layout/Button';
import { Flex } from '@frontend/components/layout/Flex';
import { Text } from '@frontend/components/layout/Typography';
import { sendToast } from '@frontend/components/ui/Toasts';

import type { Project } from '@server/database/schemas/projects';

import { endCollaboration } from '@server-actions/projects/end-collaboration';
import { startCollaboration } from '@server-actions/projects/start-collaboration';

import { useLocalStorage } from './useLocalStorage';
import { useWebsockets } from './useWebsockets';

export const onSendCurrentProjectUpdateMsg = () => {
    document.dispatchEvent(new CustomEvent('update_project'));
};

export const useCollaboration = () => {
    const [projectId] = useLocalStorage('projectId');
    const { data, mutate } = useSWR<Project>(projectId !== undefined ? `/api/projects/${projectId}` : null, jsonFetcher);
    const { data: collaborationUrlData } = useSWR<{ url: string }>(
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
