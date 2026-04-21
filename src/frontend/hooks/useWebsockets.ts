'use client';

import * as React from 'react';

import { useDeepMemo } from './useDeepMemo';

interface WebSocketManager {
    id: string;
    websocket: WebSocket;
    listeners: number;
    isClosing: boolean;
}
const getWebSocketId = (url: string, protocols: string[]) => `${url}::${protocols.join(',')}`;
const getOrCreateWebSocketManager = (url: string, protocols: string[]): WebSocketManager => {
    const id = getWebSocketId(url, protocols);
    const manager = window.websockets?.[id];
    if (!manager) {
        const newManager: WebSocketManager = {
            id,
            websocket: new WebSocket(url, protocols),
            listeners: 0,
            isClosing: false,
        };
        window.websockets = {
            ...(window.websockets || {}),
            [id]: newManager,
        };
        return newManager;
    }
    return manager;
};
const releaseWebSocketManager = (manager: WebSocketManager) => {
    manager.listeners -= 1;
    if (manager.listeners > 0) {
        return;
    }

    manager.listeners = 0;
    manager.isClosing = true;
    const websockets = window.websockets;
    if (websockets?.[manager.id] === manager) {
        delete websockets[manager.id];
    }

    if (manager.websocket.readyState === WebSocket.OPEN) {
        manager.websocket.close();
    } else if (manager.websocket.readyState === WebSocket.CONNECTING) {
        manager.websocket.onopen = () => {
            manager.websocket.close();
        };
    }
};
declare global {
    interface Window {
        websockets?: Partial<Record<string, WebSocketManager>>; // id -> WebSocketManager
    }
}

interface UseWebsocketsProps {
    url: string;
    protocols: string[];
    room?: string;
    isEnabled?: boolean;
    onSocketError?: () => void;
    onReceiveMsg?: (msg: string) => void;
}
export const useWebsockets = ({ url, protocols, isEnabled = false, onSocketError, onReceiveMsg }: UseWebsocketsProps) => {
    const [socket, setSocket] = React.useState<WebSocket | null>(null);

    // Keep a ref to the latest onReceiveMsg function
    const onReceiveMsgRef = React.useRef(onReceiveMsg);
    React.useEffect(() => {
        onReceiveMsgRef.current = onReceiveMsg;
    }, [onReceiveMsg]);

    const onSocketErrorRef = React.useRef(onSocketError);
    React.useEffect(() => {
        onSocketErrorRef.current = onSocketError;
    }, [onSocketError]);

    const sanitizedUrl = React.useMemo(() => {
        try {
            return new URL(url);
        } catch {
            return undefined;
        }
    }, [url]);

    const stableProtocols = useDeepMemo(protocols);

    React.useEffect(() => {
        if (!isEnabled || !sanitizedUrl) {
            // eslint-disable-next-line
            setSocket(null);
            return () => {};
        }

        const socketManager = getOrCreateWebSocketManager(sanitizedUrl.toString(), stableProtocols);
        socketManager.listeners += 1;
        const websocket = socketManager.websocket;

        // Update state
        if (websocket.readyState === WebSocket.OPEN) {
            setSocket(websocket);
        } else {
            setSocket(null);
        }

        // Add event listeners
        const onOpen = () => {
            setSocket(websocket);
        };
        const onError = (error: Event) => {
            if (socketManager.isClosing) {
                return;
            }
            console.warn('WebSocket error:', error);
            onSocketErrorRef.current?.();
        };
        const onMessage = (event: MessageEvent) => {
            const data = event.data;
            if (typeof data !== 'string') {
                return;
            }
            onReceiveMsgRef.current?.(data);
        };
        websocket.addEventListener('open', onOpen);
        websocket.addEventListener('error', onError);
        websocket.addEventListener('message', onMessage);
        return () => {
            websocket.removeEventListener('open', onOpen);
            websocket.removeEventListener('error', onError);
            websocket.removeEventListener('message', onMessage);
            releaseWebSocketManager(socketManager);
        };
    }, [isEnabled, sanitizedUrl, stableProtocols]);

    return socket;
};
