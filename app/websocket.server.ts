import { WebSocketServer } from "ws";
import { createServer } from "http";
import { createId as cuid } from "@paralleldrive/cuid2";

interface ChatMessage {
  type: "chat";
  message: string;
  sender: string;
  timestamp: number;
}

interface SystemMessage {
  type: "system";
  message: string;
  timestamp: number;
}

// Store active connections
const connections = new Map<string, import("ws").WebSocket>();

// Create HTTP server for WebSocket upgrade
const server = createServer();

// Create WebSocket server
const wss = new WebSocketServer({
  server,
  path: "/ws",
});

// Handle WebSocket connections
wss.on("connection", (ws) => {
  const connectionId = cuid();
  connections.set(connectionId, ws);

  console.log(`WebSocket connected: ${connectionId}`);

  // Send welcome message
  const welcomeMessage: SystemMessage = {
    type: "system",
    message: "Connected to WebSocket server",
    timestamp: Date.now(),
  };
  ws.send(JSON.stringify(welcomeMessage));

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log("Received message:", message);

      // Handle different message types
      switch (message.type) {
        case "chat": {
          // Broadcast chat message to all connected clients
          const chatMessage: ChatMessage = {
            type: "chat",
            message: message.message,
            sender: message.sender || "Anonymous",
            timestamp: Date.now(),
          };

          // Send to all connected clients
          connections.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(chatMessage));
            }
          });
          break;
        }

        case "ping":
          // Respond to ping with pong
          ws.send(
            JSON.stringify({
              type: "pong",
              timestamp: Date.now(),
            }),
          );
          break;

        default:
          // Echo back unknown message types
          ws.send(
            JSON.stringify({
              type: "echo",
              data: message,
              timestamp: Date.now(),
            }),
          );
      }
    } catch (error) {
      console.error("Error processing message:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Invalid message format",
          timestamp: Date.now(),
        }),
      );
    }
  });

  // Handle client disconnect
  ws.on("close", () => {
    connections.delete(connectionId);
    console.log(`WebSocket disconnected: ${connectionId}`);
  });

  // Handle errors
  ws.on("error", (error) => {
    console.error(`WebSocket error for ${connectionId}:`, error);
    connections.delete(connectionId);
  });
});

// Start server on port 3001 (different from main app)
const PORT = process.env.WS_PORT || 3001;
server.listen(PORT, () => {
  console.log(`WebSocket server running on ws://localhost:${PORT}/ws`);
  console.log(`Active connections: ${connections.size}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("Shutting down WebSocket server...");
  wss.close();
  server.close();
});

process.on("SIGINT", () => {
  console.log("Shutting down WebSocket server...");
  wss.close();
  server.close();
  process.exit(0);
});

// export { wss, connections };
