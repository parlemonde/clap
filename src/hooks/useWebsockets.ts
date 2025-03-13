'use client';

import * as React from 'react';

declare global {
    interface Window {
        websocket?: {
            socket: WebSocket;
            room: string;
        };
    }
}

interface UseWebsocketsProps {
    room?: string;
    isEnabled?: boolean;
    onSocketError?: () => void;
    onReceiveMsg?: (msg: string) => void;
}
export const useWebsockets = ({ room = '', isEnabled = false, onSocketError, onReceiveMsg }: UseWebsocketsProps) => {
    const [socket, setSocket] = React.useState<WebSocket | null>(null);

    // Keep a ref to the latest onReceiveMsg function
    const onReceiveMsgRef = React.useRef(onReceiveMsg);
    React.useEffect(() => {
        onReceiveMsgRef.current = onReceiveMsg;
    }, [onReceiveMsg]);

    // Initialize the WebSocket connection
    React.useEffect(() => {
        if (!isEnabled) {
            setSocket(null);
            if (window.websocket) {
                window.websocket.socket.close();
                window.websocket = undefined;
            }
            return;
        }

        // Close the previous WebSocket connection
        if (window.websocket && window.websocket.room !== room) {
            window.websocket.socket.close();
            window.websocket = undefined;
        }
        // Create a new WebSocket connection
        if (!window.websocket) {
            const newSocket = new WebSocket(
                room
                    ? `${process.env.NEXT_PUBLIC_COLLABORATION_SERVER_URL || ''}?room=${encodeURIComponent(room)}`
                    : process.env.NEXT_PUBLIC_COLLABORATION_SERVER_URL || '',
            );
            newSocket.onerror = (error) => {
                console.warn('WebSocket error:', error);
                onSocketError?.();
            };
            newSocket.onopen = () => {
                setSocket(newSocket); // Set the socket only after it's open
            };
            window.websocket = {
                socket: newSocket,
                room,
            };
            window.onbeforeunload = () => {
                window.websocket?.socket.close();
            };
        } else {
            const newSocket = window.websocket.socket;
            if (newSocket.readyState === WebSocket.OPEN) {
                setSocket(window.websocket.socket);
            } else {
                newSocket.addEventListener('open', () => {
                    setSocket(newSocket);
                });
                // No need to listen for error events, as the error event is already handled above by another mounted hook
            }
        }
    }, [onSocketError, isEnabled, room]);

    // Listen for incoming messages
    React.useEffect(() => {
        if (socket) {
            const onMessage = (event: MessageEvent) => {
                const data = event.data;
                if (typeof data !== 'string') {
                    return;
                }
                onReceiveMsgRef.current?.(data);
            };
            socket.addEventListener('message', onMessage);
            return () => {
                socket.removeEventListener('message', onMessage);
            };
        }
        return () => {};
    }, [socket]);

    return socket;
};
