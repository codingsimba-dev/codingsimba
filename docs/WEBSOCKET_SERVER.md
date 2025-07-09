# WebSocket Server Setup

## Overview

This project includes a standalone WebSocket server that can be run alongside the main Remix application for real-time features like chat, notifications, and live updates.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the WebSocket Server

```bash
# Option 1: Start WebSocket server only
npm run dev:ws

# Option 2: Start both main app and WebSocket server together
npm run dev:full

# Option 3: Start Remix app (WebSocket server auto-starts in development)
npm run dev
```

### 3. Connect from Client

```tsx
import { useWebSocket } from "~/hooks/use-websocket";

function MyComponent() {
  const { isConnected, send, lastMessage } = useWebSocket({
    url: "ws://localhost:3001/ws",
    autoReconnect: true,
  });

  return (
    <div>
      <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
      <button onClick={() => send({ type: "chat", message: "Hello!" })}>
        Send Message
      </button>
    </div>
  );
}
```

## Server Features

### Message Types

The server handles different message types:

#### Chat Messages

```json
{
  "type": "chat",
  "message": "Hello, world!",
  "sender": "User123"
}
```

#### Ping/Pong

```json
{
  "type": "ping"
}
```

#### System Messages

```json
{
  "type": "system",
  "message": "User joined the chat"
}
```

### Broadcasting

Chat messages are automatically broadcast to all connected clients, making it perfect for:

- Real-time chat applications
- Live notifications
- Collaborative features
- Live dashboards

## Configuration

### Environment Variables

```env
# WebSocket server port (default: 3001)
WS_PORT=3001
```

### Server Options

The WebSocket server runs on a separate port (3001) from the main application to avoid conflicts and allow independent scaling.

## Development Workflow

### Option 1: Auto-Start (Recommended)

```bash
# WebSocket server automatically starts with Remix app
npm run dev
```

### Option 2: Manual Control

```bash
# Terminal 1: Main app
npm run dev

# Terminal 2: WebSocket server
npm run dev:ws
```

### Option 3: Combined Process

```bash
# Start both together with custom script
npm run dev:full
```

## Production Deployment

### Docker Setup

Add to your Dockerfile:

```dockerfile
# Copy WebSocket server script
COPY scripts/websocket-server.ts /app/scripts/

# Install dependencies
RUN npm install

# Start both services
CMD ["npm", "run", "dev:full"]
```

### Environment Configuration

```env
# Production WebSocket URL
WS_URL=wss://yourdomain.com/ws
WS_PORT=3001
```

## Integration Examples

### Real-time Chat

```tsx
function ChatRoom() {
  const { messages, send, isConnected } = useWebSocket({
    url: "ws://localhost:3001/ws",
    autoReconnect: true,
  });

  const sendMessage = (text: string) => {
    send({
      type: "chat",
      message: text,
      sender: "CurrentUser",
    });
  };

  return (
    <div>
      {messages.map((msg, idx) => (
        <div key={idx}>
          <strong>{msg.data.sender}:</strong> {msg.data.message}
        </div>
      ))}
    </div>
  );
}
```

### Live Notifications

```tsx
function NotificationCenter() {
  const { lastMessage } = useWebSocket({
    url: "ws://localhost:3001/ws",
    enableHeartbeat: true,
  });

  React.useEffect(() => {
    if (lastMessage?.data.type === "system") {
      toast(lastMessage.data.message);
    }
  }, [lastMessage]);

  return <div>Notification Center</div>;
}
```

## Troubleshooting

### Connection Issues

1. **Check if server is running**: `npm run dev:ws`
2. **Verify port**: Default is 3001, check for conflicts
3. **Check URL**: Ensure client connects to `ws://localhost:3001/ws`

### Message Issues

1. **Format**: Messages must be valid JSON
2. **Type**: Include `type` field for proper routing
3. **Encoding**: Use UTF-8 encoding

### Performance

1. **Connection limits**: Monitor active connections
2. **Memory usage**: Messages are stored in memory
3. **Scaling**: Consider Redis for multiple server instances

## Advanced Features

### Custom Message Handlers

Extend the server in `scripts/websocket-server.ts`:

```typescript
case "custom": {
  // Handle custom message type
  const customMessage = {
    type: "custom_response",
    data: message.data,
    timestamp: Date.now(),
  };

  // Send to specific client or broadcast
  ws.send(JSON.stringify(customMessage));
  break;
}
```

### Database Integration

Add database operations for message persistence:

```typescript
// Save messages to database
if (message.type === "chat") {
  await prisma.message.create({
    data: {
      content: message.message,
      userId: message.userId,
      type: "chat",
    },
  });
}
```

### Authentication

Add authentication to WebSocket connections:

```typescript
wss.on("connection", (ws, request) => {
  // Extract token from request headers
  const token = request.headers.authorization;

  if (!isValidToken(token)) {
    ws.close(1008, "Unauthorized");
    return;
  }

  // Continue with connection...
});
```
