'use client';

import * as React from 'react';

declare global {
    interface Window {
        socket?: WebSocket;
    }
}

export const useWebsockets = (onReceiveMsg?: (msg: string) => void) => {
    const [socket, setSocket] = React.useState<WebSocket | null>(null);

    // Keep a ref to the latest onReceiveMsg function
    const onReceiveMsgRef = React.useRef(onReceiveMsg);
    React.useEffect(() => {
        onReceiveMsgRef.current = onReceiveMsg;
    }, [onReceiveMsg]);

    // Initialize the WebSocket connection
    React.useEffect(() => {
        if (!window.socket) {
            const newSocket = new WebSocket('ws://localhost:9000');
            newSocket.onerror = (error) => {
                console.warn('WebSocket error:', error);
            };
            newSocket.onopen = () => {
                setSocket(newSocket);
                window.socket = newSocket;
                window.onbeforeunload = () => {
                    window.socket?.close();
                };
            };
        } else {
            setSocket(window.socket);
        }
    }, []);

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
