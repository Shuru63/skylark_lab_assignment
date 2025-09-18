import { WebSocket } from 'ws';
import { verifyToken } from './jwt';

interface WebSocketClient extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

export const handleWebSocketConnection = async (ws: WebSocketClient) => {
  ws.isAlive = true;

  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', async (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());
      if (message.type === 'AUTH') {
        try {
          // message.token should be the JWT
          const payload = await verifyToken(message.token);
          ws.userId = payload.userId;
          console.log(`WebSocket authenticated for user ${payload.userId}`);
          // optionally send an ACK
          ws.send(JSON.stringify({ type: 'AUTH_ACK' }));
        } catch (error) {
          console.error('WebSocket authentication failed:', error);
          ws.close(1008, 'Authentication failed');
        }
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
};

// heartbeat
setInterval(() => {
  try {
    (global as any).wss?.clients.forEach((ws: WebSocketClient) => {
      if (!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  } catch (err) {
    // ignore
  }
}, 30000);

export const broadcastAlert = (userId: string, alert: any) => {
  (global as any).wss?.clients.forEach((client: WebSocketClient) => {
    if (client.readyState === WebSocket.OPEN && client.userId === userId) {
      client.send(JSON.stringify({ type: 'ALERT', payload: alert }));
    }
  });
};
