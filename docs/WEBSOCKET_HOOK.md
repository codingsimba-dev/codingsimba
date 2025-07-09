# WebSocket Hook Documentation

## Overview

The `useWebSocket` hook provides a comprehensive solution for managing WebSocket connections in React components. It includes automatic reconnection, message handling, heartbeat support, and TypeScript integration.

## Features

- ✅ **Automatic Reconnection** - Configurable retry logic with exponential backoff
- ✅ **Message Management** - Store and manage incoming messages
- ✅ **TypeScript Support** - Full type safety with generics
- ✅ **Heartbeat Support** - Keep connections alive with configurable heartbeats
- ✅ **Error Handling** - Comprehensive error tracking and handling
- ✅ **Connection State Management** - Real-time connection status updates
- ✅ **Event Callbacks** - Custom handlers for open, close, message, and error events
- ✅ **Manual Controls** - Connect, disconnect, reconnect, and clear messages

## Basic Usage

### Simple WebSocket Connection

```tsx
import { useSimpleWebSocket } from "~/hooks/use-websocket";

function ChatComponent() {
  const { isConnected, send, lastMessage } = useSimpleWebSocket(
    "ws://localhost:3000/chat",
  );

  const handleSend = () => {
    send({ message: "Hello, world!" });
  };

  return (
    <div>
      <button onClick={handleSend} disabled={!isConnected}>
        Send Message
      </button>
      <div>Last message: {lastMessage?.data}</div>
    </div>
  );
}
```

### Advanced WebSocket Connection

```tsx
import { useWebSocket } from "~/hooks/use-websocket";

interface ChatMessage {
  type: "chat";
  message: string;
  sender: string;
}

function AdvancedChatComponent() {
  const {
    status,
    isConnected,
    messages,
    lastMessage,
    error,
    reconnectAttempts,
    send,
    disconnect,
    connect,
    clearMessages,
    reconnect,
  } = useWebSocket<ChatMessage>(
    {
      url: "ws://localhost:3000/chat",
      autoReconnect: true,
      maxReconnectAttempts: 5,
      reconnectDelay: 1000,
      enableHeartbeat: true,
      heartbeatInterval: 30000,
    },
    (message) => {
      console.log("Received:", message);
    },
    (event) => {
      console.log("Connected:", event);
    },
    (event) => {
      console.log("Disconnected:", event);
    },
    (event) => {
      console.log("Error:", event);
    },
  );

  return (
    <div>
      <div>Status: {status}</div>
      <div>Connected: {isConnected ? "Yes" : "No"}</div>
      <div>Reconnect attempts: {reconnectAttempts}</div>

      {error && <div>Error: {error.type}</div>}

      <button
        onClick={() =>
          send({ type: "chat", message: "Hello!", sender: "User" })
        }
      >
        Send
      </button>

      <button onClick={disconnect}>Disconnect</button>
      <button onClick={connect}>Connect</button>
      <button onClick={reconnect}>Reconnect</button>
      <button onClick={clearMessages}>Clear Messages</button>
    </div>
  );
}
```

## API Reference

### `useWebSocket<T>(options, callbacks?)`

#### Parameters

##### `options: WebSocketOptions`

```typescript
interface WebSocketOptions {
  /** The WebSocket URL to connect to */
  url: string;
  /** WebSocket protocols to use */
  protocols?: string | string[];
  /** Whether to automatically reconnect on connection loss */
  autoReconnect?: boolean;
  /** Maximum number of reconnection attempts */
  maxReconnectAttempts?: number;
  /** Delay between reconnection attempts in milliseconds */
  reconnectDelay?: number;
  /** Whether to connect immediately on mount */
  connectOnMount?: boolean;
  /** Custom headers to send with the connection */
  headers?: Record<string, string>;
  /** Heartbeat interval in milliseconds to keep connection alive */
  heartbeatInterval?: number;
  /** Heartbeat message to send */
  heartbeatMessage?: string;
  /** Whether to enable heartbeat */
  enableHeartbeat?: boolean;
}
```

##### `callbacks` (optional)

```typescript
{
  onMessage?: (message: WebSocketMessage<T>) => void;
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
}
```

#### Returns

```typescript
WebSocketState<T> & WebSocketActions;
```

##### `WebSocketState<T>`

```typescript
interface WebSocketState<T> {
  /** Current connection status */
  status: WebSocketStatus;
  /** Whether the connection is ready to send messages */
  isConnected: boolean;
  /** The WebSocket instance */
  socket: WebSocket | null;
  /** Last received message */
  lastMessage: WebSocketMessage<T> | null;
  /** All received messages */
  messages: WebSocketMessage<T>[];
  /** Number of reconnection attempts */
  reconnectAttempts: number;
  /** Last error that occurred */
  error: Event | null;
}
```

##### `WebSocketActions`

```typescript
interface WebSocketActions {
  /** Connect to the WebSocket */
  connect: () => void;
  /** Disconnect from the WebSocket */
  disconnect: () => void;
  /** Send a message through the WebSocket */
  send: (message: unknown) => void;
  /** Clear all stored messages */
  clearMessages: () => void;
  /** Manually trigger a reconnection */
  reconnect: () => void;
}
```

### `useSimpleWebSocket(url, options?)`

A simplified version of the hook with sensible defaults.

#### Parameters

- `url: string` - The WebSocket URL
- `options?: Partial<WebSocketOptions>` - Optional configuration

## Connection Status

The hook provides the following connection statuses:

- `"connecting"` - Attempting to establish connection
- `"open"` - Connection is established and ready
- `"closing"` - Connection is being closed
- `"closed"` - Connection is closed

## Message Format

Messages are automatically parsed and stored with the following structure:

```typescript
interface WebSocketMessage<T> {
  type?: string;
  data: T;
  timestamp: number;
}
```

## Reconnection Strategy

The hook implements an exponential backoff strategy for reconnections:

1. **Initial Delay**: `reconnectDelay` milliseconds
2. **Backoff**: Each attempt doubles the delay
3. **Maximum Attempts**: Stops after `maxReconnectAttempts`
4. **Reset**: Reconnect attempts reset when connection is successful

## Heartbeat Support

Enable heartbeat to keep connections alive:

```tsx
const { isConnected } = useWebSocket({
  url: "ws://localhost:3000",
  enableHeartbeat: true,
  heartbeatInterval: 30000, // 30 seconds
  heartbeatMessage: "ping",
});
```

## Error Handling

The hook provides comprehensive error handling:

```tsx
const { error, status } = useWebSocket({
  url: "ws://localhost:3000",
});

// Handle errors
if (error) {
  console.error("WebSocket error:", error);
}

// Check connection status
if (status === "closed") {
  // Handle closed connection
}
```

## Best Practices

### 1. Type Safety

Always define message types for better type safety:

```tsx
interface ChatMessage {
  type: "chat";
  message: string;
  sender: string;
}

const { send } = useWebSocket<ChatMessage>({
  url: "ws://localhost:3000/chat",
});
```

### 2. Error Boundaries

Wrap WebSocket components in error boundaries:

```tsx
function WebSocketComponent() {
  const { error } = useWebSocket({
    url: "ws://localhost:3000",
  });

  if (error) {
    return <div>Connection error. Please try again.</div>;
  }

  return <div>Connected!</div>;
}
```

### 3. Cleanup

The hook automatically cleans up on unmount, but you can manually disconnect:

```tsx
function MyComponent() {
  const { disconnect } = useWebSocket({
    url: "ws://localhost:3000",
  });

  React.useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);
}
```

### 4. Message Validation

Validate incoming messages:

```tsx
const { lastMessage } = useWebSocket<ChatMessage>(
  {
    url: "ws://localhost:3000",
  },
  (message) => {
    // Validate message structure
    if (message.data.type === "chat" && message.data.message) {
      // Process valid message
    }
  },
);
```

## Examples

### Real-time Chat

```tsx
function ChatRoom() {
  const [input, setInput] = React.useState("");
  const { isConnected, messages, send } = useWebSocket<ChatMessage>({
    url: "ws://localhost:3000/chat",
    autoReconnect: true,
  });

  const handleSend = () => {
    if (input.trim()) {
      send({
        type: "chat",
        message: input,
        sender: "User",
      });
      setInput("");
    }
  };

  return (
    <div>
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx}>
            <strong>{msg.data.sender}:</strong> {msg.data.message}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleSend()}
        disabled={!isConnected}
      />
      <button onClick={handleSend} disabled={!isConnected}>
        Send
      </button>
    </div>
  );
}
```

### Real-time Notifications

```tsx
function NotificationCenter() {
  const { lastMessage } = useWebSocket<Notification>({
    url: "ws://localhost:3000/notifications",
    enableHeartbeat: true,
  });

  React.useEffect(() => {
    if (lastMessage?.data.type === "notification") {
      // Show notification toast
      toast(lastMessage.data.message);
    }
  }, [lastMessage]);

  return <div>Notification Center</div>;
}
```

### Live Data Updates

```tsx
function LiveDashboard() {
  const { messages } = useWebSocket<DataUpdate>({
    url: "ws://localhost:3000/data",
    autoReconnect: true,
    maxReconnectAttempts: 10,
  });

  const latestData = messages[messages.length - 1]?.data;

  return (
    <div>
      <h2>Live Dashboard</h2>
      {latestData && (
        <div>
          <p>Last Update: {new Date(latestData.timestamp).toLocaleString()}</p>
          <p>Value: {latestData.value}</p>
        </div>
      )}
    </div>
  );
}
```

## Migration from Manual WebSocket

If you're currently using manual WebSocket connections, here's how to migrate:

### Before (Manual WebSocket)

```tsx
function OldComponent() {
  const [socket, setSocket] = React.useState<WebSocket | null>(null);
  const [messages, setMessages] = React.useState([]);

  React.useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000");

    ws.onopen = () => setSocket(ws);
    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, JSON.parse(event.data)]);
    };
    ws.onclose = () => setSocket(null);

    return () => ws.close();
  }, []);

  const sendMessage = (message) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  };

  return <div>...</div>;
}
```

### After (Using Hook)

```tsx
function NewComponent() {
  const { isConnected, messages, send } = useWebSocket({
    url: "ws://localhost:3000",
    autoReconnect: true,
  });

  const sendMessage = (message) => {
    send(message);
  };

  return <div>...</div>;
}
```

## Troubleshooting

### Connection Issues

1. **Check URL**: Ensure the WebSocket URL is correct
2. **CORS**: Verify CORS settings on the server
3. **Protocol**: Make sure the protocol (ws:// or wss://) is correct
4. **Network**: Check network connectivity

### Reconnection Issues

1. **Max Attempts**: Increase `maxReconnectAttempts` if needed
2. **Delay**: Adjust `reconnectDelay` for your use case
3. **Server**: Ensure the server is configured to handle reconnections

### Message Issues

1. **Parsing**: Check if messages are valid JSON
2. **Type Safety**: Define proper TypeScript interfaces
3. **Validation**: Add message validation in callbacks

## Performance Considerations

1. **Message Storage**: Clear messages periodically to prevent memory leaks
2. **Heartbeat**: Use appropriate heartbeat intervals
3. **Reconnection**: Balance reconnection attempts with user experience
4. **Memory**: The hook automatically cleans up on unmount
