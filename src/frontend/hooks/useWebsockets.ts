'use client';

import * as React from 'react';

declare global {
    interface Window {
        websocket?: WebSocket;
    }
}

interface UseWebsocketsProps {
    url: string;
    room?: string;
    isEnabled?: boolean;
    onSocketError?: () => void;
    onReceiveMsg?: (msg: string) => void;
}
export const useWebsockets = ({ url, isEnabled = false, onSocketError, onReceiveMsg }: UseWebsocketsProps) => {
    const [socket, setSocket] = React.useState<WebSocket | null>(null);

    // Keep a ref to the latest onReceiveMsg function
    const onReceiveMsgRef = React.useRef(onReceiveMsg);
    React.useEffect(() => {
        onReceiveMsgRef.current = onReceiveMsg;
    }, [onReceiveMsg]);

    const sanitizedUrl = React.useMemo(() => {
        try {
            return new URL(url);
        } catch {
            return undefined;
        }
    }, [url]);

    // Initialize the WebSocket connection
    React.useEffect(() => {
        if (!isEnabled || !sanitizedUrl) {
            setSocket(null);
            if (window.websocket) {
                window.websocket.close();
                window.websocket = undefined;
            }
            return;
        }

        // Close the previous WebSocket connection
        if (window.websocket && window.websocket.url !== sanitizedUrl.toString()) {
            window.websocket.close();
            window.websocket = undefined;
        }
        // Create a new WebSocket connection
        if (!window.websocket) {
            const newSocket = new WebSocket(sanitizedUrl.toString());
            newSocket.onerror = (error) => {
                console.warn('WebSocket error:', error);
                onSocketError?.();
            };
            newSocket.onopen = () => {
                setSocket(newSocket); // Set the socket only after it's open
            };
            window.websocket = newSocket;
            window.onbeforeunload = () => {
                window.websocket?.close();
            };
        } else {
            const newSocket = window.websocket;
            if (newSocket.readyState === WebSocket.OPEN) {
                setSocket(window.websocket);
            } else {
                newSocket.addEventListener('open', () => {
                    setSocket(newSocket);
                });
                // No need to listen for error events, as the error event is already handled above by another mounted hook
            }
        }
    }, [onSocketError, isEnabled, sanitizedUrl]);

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
