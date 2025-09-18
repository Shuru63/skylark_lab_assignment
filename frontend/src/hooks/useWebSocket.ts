import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useWebSocket = () => {
  const ws = useRef<WebSocket | null>(null);
  const { token } = useAuth();
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);

  useEffect(() => {
    if (token) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      ws.current = new WebSocket(wsUrl);
      ws.current.onopen = () => {
        console.log('WebSocket connected');
        // Send authentication token
        ws.current?.send(JSON.stringify({ type: 'AUTH', token }));
      };
      
      ws.current.onmessage = (event) => {
        setLastMessage(event);
      };
      
      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
      };

      return () => {
        ws.current?.close();
      };
    }
  }, [token]);

  const sendMessage = useCallback((message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  return { lastMessage, sendMessage };
};