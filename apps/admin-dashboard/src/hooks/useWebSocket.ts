import { useEffect, useState, useRef } from 'react';
import { getCookie } from '@/lib/utils';

// Dynamic import for socket.io-client to avoid build issues
let io: any;
if (typeof window !== 'undefined') {
  io = require('socket.io-client').io;
}

interface UseWebSocketOptions {
  namespace: string;
  events: Record<string, (data: any) => void>;
}

export function useWebSocket({ namespace, events }: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    const token = getCookie('auth-token');
    if (!token || !io) return;

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [namespace]);

  return { 
    socket: socketRef.current, 
    isConnected 
  };
}