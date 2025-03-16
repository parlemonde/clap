import React from 'react';
import useSWR from 'swr';

import { useLocalStorage } from './useLocalStorage';
import { useWebsockets } from './useWebsockets';
import { logout } from 'src/actions/authentication/logout';
import { endCollaboration } from 'src/actions/projects/end-collaboration';
import { startCollaboration } from 'src/actions/projects/start-collaboration';
import type { VerifyAlertData } from 'src/components/collaboration/AlertModal';
import { sendCollaborationVerifyAlert } from 'src/components/collaboration/AlertModal';
import { Button } from 'src/components/layout/Button';
import { Flex } from 'src/components/layout/Flex';
import { Text } from 'src/components/layout/Typography';
import { sendToast } from 'src/components/ui/Toasts';
import type { Project } from 'src/database/schemas/projects';
import { jsonFetcher } from 'src/lib/json-fetcher';
import type { Sequence } from 'src/lib/project.types';

export const onSendCurrentProjectUpdateMsg = () => {
    document.dispatchEvent(new CustomEvent('update_project'));
};

export const useCollaboration = () => {
    const [projectId] = useLocalStorage('projectId');
    const { data, mutate } = useSWR<Project>(projectId !== undefined ? `/api/projects/${projectId}` : null, jsonFetcher);

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
    const sendCollaborationValidationMsg = (questionId: number, status: Sequence['status']) => {
        socket?.send(`validate_question:${JSON.stringify({ questionId, status })}`);
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
