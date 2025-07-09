# WebSocket Hook Documentation

## Overview

The `useWebSocket` hook provides a comprehensive solution for managing WebSocket connections in React applications. It includes automatic reconnection, message handling, heartbeat support, and full TypeScript integration.

## Features

- ✅ **Automatic Reconnection** - Configurable exponential backoff
- ✅ **Message History** - Configurable message storage with automatic cleanup
- ✅ **Heartbeat Support** - Keep connections alive with configurable intervals
- ✅ **TypeScript Support** - Full type safety with generics
- ✅ **Event Callbacks** - Handle connection events with custom callbacks
- ✅ **Error Handling** - Comprehensive error state management
- ✅ **Memory Management** - Automatic cleanup and message limiting
- ✅ **Connection Control** - Manual connect/disconnect/reconnect actions

## Basic Usage

```tsx
import { useWebSocket } from "~/hooks/use-websocket";

function ChatComponent() {
  const { isConnected, send, lastMessage } = useWebSocket({
    url: "ws://localhost:3000/chat",
    autoReconnect: true,
  });

  return (
    <div>
      <button onClick={() => send({ type: "chat", message: "Hello!" })}>
        Send Message
      </button>
      <div>Status: {isConnected ? "Connected" : "Disconnected"}</div>
      {lastMessage && (
        <div>Last message: {JSON.stringify(lastMessage.data)}</div>
      )}
    </div>
  );
}
```

## Advanced Usage

```tsx
import { useWebSocket, type WebSocketMessage } from "~/hooks/use-websocket";

interface ChatMessage {
  type: "chat";
  message: string;
  sender: string;
  timestamp: number;
}

function AdvancedChat() {
  const { status, messages, send, error, reconnect } = useWebSocket<ChatMessage>(
    {
      url: "ws://localhost:3000/chat",
      autoReconnect: true,
      maxReconnectAttempts: 5,
      enableHeartbeat: true,
      heartbeatInterval: 30000,
      maxMessages: 100,
    },
    (message) => {
      console.log("Received:", message.data);
    },
    (event) => {
      console.log("Connected:", event);
    },
    (event) => {
      console.log("Disconnected:", event);
    },
    (event) => {
      console.log("Error:", event);
    }
  );

  return (
    <div>
      <div>Status: {status}</div>
      {error && <div>Error: {error.type}</div>}
      <button onClick={reconnect}>Reconnect</button>
      
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx}>
            <strong>{msg.data.sender}:</strong> {msg.data.message}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## API Reference

### Hook Parameters

```tsx
useWebSocket<T>(
  options: WebSocketOptions,
  onMessage?: (message: WebSocketMessage<T>) => void,
  onOpen?: (event: Event) => void,
  onClose?: (event: CloseEvent) => void,
  onError?: (event: Event) => void
): WebSocketState<T> & WebSocketActions
```

### WebSocketOptions

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `url` | `string` | **Required** | WebSocket URL to connect to |
| `protocols` | `string \| string[]` | `undefined` | WebSocket protocols |
| `autoReconnect` | `boolean` | `true` | Enable automatic reconnection |
| `maxReconnectAttempts` | `number` | `5` | Maximum reconnection attempts |
| `reconnectDelay` | `number` | `1000` | Base delay between reconnections (ms) |
| `connectOnMount` | `boolean` | `true` | Connect immediately on mount |
| `headers` | `Record<string, string>` | `{}` | Custom headers (browser support limited) |
| `heartbeatInterval` | `number` | `30000` | Heartbeat interval (ms) |
| `heartbeatMessage` | `string` | `"ping"` | Heartbeat message to send |
| `enableHeartbeat` | `boolean` | `false` | Enable heartbeat functionality |
| `maxMessages` | `number` | `1000` | Maximum messages to store in history |

### Return Value

The hook returns an object containing both state and actions:

#### State Properties

| Property | Type | Description |
|----------|------|-------------|
| `status` | `"connecting" \| "open" \| "closing" \| "closed"` | Current connection status |
| `isConnected` | `boolean` | Whether connection is ready for sending |
| `lastMessage` | `WebSocketMessage<T> \| null` | Most recent message received |
| `messages` | `WebSocketMessage<T>[]` | All received messages (limited by maxMessages) |
| `reconnectAttempts` | `number` | Number of reconnection attempts made |
| `error` | `Event \| null` | Last error that occurred |

#### Action Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `connect()` | None | Manually connect to WebSocket |
| `disconnect()` | None | Disconnect and clean up resources |
| `send(message)` | `unknown` | Send a message (auto-stringified if not string) |
| `clearMessages()` | None | Clear all stored messages |
| `reconnect()` | None | Manually trigger reconnection |

### WebSocketMessage Interface

```tsx
interface WebSocketMessage<T = unknown> {
  type?: string;        // Extracted from data.type if available
  data: T;             // The actual message data
  timestamp: number;   // When message was received
}
```

## Best Practices

### 1. Type Safety

Always define message types for better development experience:

```tsx
interface ServerMessage {
  type: "notification" | "update" | "error";
  payload: unknown;
}

const { messages } = useWebSocket<ServerMessage>({ url: "ws://..." });
// messages[0].data.type is now properly typed
```

### 2. Error Handling

Implement proper error handling:

```tsx
const { error, status } = useWebSocket({
  url: "ws://...",
  onError: (event) => {
    // Log to monitoring service
    console.error("WebSocket error:", event);
  },
});

if (error) {
  return <div>Connection error occurred</div>;
}
```

### 3. Memory Management

Limit message history to prevent memory issues:

```tsx
const { messages } = useWebSocket({
  url: "ws://...",
  maxMessages: 100, // Keep only last 100 messages
});
```

### 4. Reconnection Strategy

Configure reconnection for your use case:

```tsx
const { reconnectAttempts } = useWebSocket({
  url: "ws://...",
  autoReconnect: true,
  maxReconnectAttempts: 10,
  reconnectDelay: 2000, // Start with 2 second delay
});
```

### 5. Heartbeat for Long Connections

Use heartbeat for connections that need to stay alive:

```tsx
const { isConnected } = useWebSocket({
  url: "ws://...",
  enableHeartbeat: true,
  heartbeatInterval: 30000, // Send ping every 30 seconds
  heartbeatMessage: "ping",
});
```

## Common Patterns

### Real-time Chat

```tsx
function ChatRoom() {
  const [input, setInput] = useState("");
  const { isConnected, send, messages } = useWebSocket<ChatMessage>({
    url: "ws://localhost:3000/chat",
    autoReconnect: true,
  });

  const handleSend = () => {
    if (input.trim()) {
      send({ type: "chat", message: input, sender: "user" });
      setInput("");
    }
  };

  return (
    <div>
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx}>{msg.data.message}</div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleSend()}
      />
      <button onClick={handleSend} disabled={!isConnected}>
        Send
      </button>
    </div>
  );
}
```

### Live Updates

```tsx
function LiveDashboard() {
  const { lastMessage, isConnected } = useWebSocket<DashboardUpdate>({
    url: "ws://localhost:3000/dashboard",
    autoReconnect: true,
    enableHeartbeat: true,
  });

  useEffect(() => {
    if (lastMessage) {
      // Update dashboard with new data
      updateDashboard(lastMessage.data);
    }
  }, [lastMessage]);

  return (
    <div>
      <div className="status">
        {isConnected ? "🟢 Live" : "🔴 Disconnected"}
      </div>
      {/* Dashboard content */}
    </div>
  );
}
```

### Connection Management

```tsx
function ConnectionManager() {
  const { status, connect, disconnect, reconnect } = useWebSocket({
    url: "ws://localhost:3000/api",
    connectOnMount: false, // Don't connect automatically
  });

  return (
    <div>
      <div>Status: {status}</div>
      <button onClick={connect}>Connect</button>
      <button onClick={disconnect}>Disconnect</button>
      <button onClick={reconnect}>Reconnect</button>
    </div>
  );
}
```

## Troubleshooting

### Connection Issues

1. **Check URL format**: Ensure WebSocket URL starts with `ws://` or `wss://`
2. **CORS issues**: WebSocket connections may be blocked by CORS policies
3. **Server availability**: Verify the WebSocket server is running and accessible

### Performance Issues

1. **Message history**: Limit `maxMessages` to prevent memory leaks
2. **Reconnection attempts**: Set reasonable `maxReconnectAttempts` to avoid infinite loops
3. **Heartbeat frequency**: Don't set heartbeat too frequently (minimum 5-10 seconds)

### TypeScript Issues

1. **Generic types**: Always specify the message type for better type safety
2. **Message parsing**: Handle both JSON and string messages in your callbacks
3. **Error types**: Use proper error handling for different error scenarios

## Browser Support

- ✅ Chrome 16+
- ✅ Firefox 11+
- ✅ Safari 7+
- ✅ Edge 12+
- ✅ Internet Explorer 10+

## License

This hook is part of the website project and follows the same licensing terms. 