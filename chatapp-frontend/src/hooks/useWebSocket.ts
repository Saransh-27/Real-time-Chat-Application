'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { Message } from '@/lib/types';
import { API_BASE_URL } from '@/lib/api';

interface UseWebSocketOptions {
    roomId: string;
    onMessage: (message: Message) => void;
}

export function useWebSocket({ roomId, onMessage }: UseWebSocketOptions) {
    const clientRef = useRef<Client | null>(null);
    const [connected, setConnected] = useState(false);
    const onMessageRef = useRef(onMessage);

    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    const connect = useCallback(() => {
        if (clientRef.current?.active) return;

        const client = new Client({
            webSocketFactory: () => new SockJS(`${API_BASE_URL}/chat`),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                setConnected(true);
                client.subscribe(`/topic/room/${roomId}`, (frame) => {
                    try {
                        const msg: Message = JSON.parse(frame.body);
                        onMessageRef.current(msg);
                    } catch { /* empty */ }
                });
            },
            onDisconnect: () => setConnected(false),
            onStompError: () => setConnected(false),
        });

        client.activate();
        clientRef.current = client;
    }, [roomId]);

    const disconnect = useCallback(() => {
        if (clientRef.current?.active) {
            clientRef.current.deactivate();
            clientRef.current = null;
            setConnected(false);
        }
    }, []);

    const sendMessage = useCallback(
        (sender: string, content: string, senderProfilePhoto?: string | null) => {
            if (!clientRef.current?.active) return;
            clientRef.current.publish({
                destination: `/app/sendMessage/${roomId}`,
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ sender, content, roomId, senderProfilePhoto }),
            });
        },
        [roomId]
    );

    useEffect(() => {
        connect();
        return () => disconnect();
    }, [connect, disconnect]);

    return { connected, sendMessage, disconnect };
}
