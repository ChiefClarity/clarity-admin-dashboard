import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthWithToken } from '@/hooks/useAuth';

interface UseWebSocketOptions {
  namespace: string;
  events: Record<string, (data: any) => void>;
}

export function useWebSocket({ namespace, events }: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const { token } = useAuthWithToken();

  useEffect(() => {
    if (!token) return;

    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/${namespace}`, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log(`Connected to ${namespace} namespace`);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log(`Disconnected from ${namespace} namespace`);
    });

    // Register event handlers
    Object.entries(events).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      socket.disconnect();
    };
  }, [namespace, token]);

  return { 
    socket: socketRef.current, 
    isConnected 
  };
}