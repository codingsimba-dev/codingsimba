import React from "react";

/**
 * WebSocket connection status types
 */
export type WebSocketStatus = "connecting" | "open" | "closing" | "closed";

/**
 * Represents a WebSocket message with metadata
 */
export interface WebSocketMessage<T = unknown> {
  /** Message type identifier (extracted from data.type if available) */
  type?: string;
  /** The actual message data */
  data: T;
  /** Timestamp when the message was received */
  timestamp: number;
}

/**
 * Configuration options for the WebSocket hook
 */
export interface WebSocketOptions {
  /** The WebSocket URL to connect to (e.g., "ws://localhost:3000/chat") */
  url: string;
  /** WebSocket protocols to use */
  protocols?: string | string[];
  /** Whether to automatically reconnect on connection loss (default: true) */
  autoReconnect?: boolean;
  /** Maximum number of reconnection attempts (default: 5) */
  maxReconnectAttempts?: number;
  /** Delay between reconnection attempts in milliseconds (default: 1000) */
  reconnectDelay?: number;
  /** Whether to connect immediately on mount (default: true) */
  connectOnMount?: boolean;
  /** Custom headers to send with the connection */
  headers?: Record<string, string>;
  /** Heartbeat interval in milliseconds to keep connection alive (default: 30000) */
  heartbeatInterval?: number;
  /** Heartbeat message to send (default: "ping") */
  heartbeatMessage?: string;
  /** Whether to enable heartbeat (default: false) */
  enableHeartbeat?: boolean;
  /** Maximum number of messages to store in history (default: 1000) */
  maxMessages?: number;
}

/**
 * Current state of the WebSocket connection
 */
export interface WebSocketState<T = unknown> {
  /** Current connection status */
  status: WebSocketStatus;
  /** Whether the connection is ready to send messages */
  isConnected: boolean;
  /** Last received message */
  lastMessage: WebSocketMessage<T> | null;
  /** All received messages (limited by maxMessages) */
  messages: WebSocketMessage<T>[];
  /** Number of reconnection attempts made */
  reconnectAttempts: number;
  /** Last error that occurred */
  error: Event | null;
}

/**
 * Actions available to control the WebSocket connection
 */
export interface WebSocketActions {
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

/**
 * A comprehensive WebSocket hook that provides connection management,
 * automatic reconnection, message handling, and TypeScript support.
 *
 * @template T - The type of message data
 * @param options - Configuration options for the WebSocket connection
 * @param onMessage - Optional callback for handling incoming messages
 * @param onOpen - Optional callback for when connection opens
 * @param onClose - Optional callback for when connection closes
 * @param onError - Optional callback for when errors occur
 * @returns Object containing connection state and control actions
 *
 * @example
 * ```tsx
 * // Basic usage
 * function ChatComponent() {
 *   const { isConnected, send, lastMessage } = useWebSocket({
 *     url: "ws://localhost:3000/chat",
 *     autoReconnect: true,
 *   });
 *
 *   return (
 *     <div>
 *       <button onClick={() => send({ type: "chat", message: "Hello!" })}>
 *         Send Message
 *       </button>
 *       <div>Status: {isConnected ? "Connected" : "Disconnected"}</div>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Advanced usage with callbacks and typed messages
 * interface ChatMessage {
 *   type: "chat";
 *   message: string;
 *   sender: string;
 * }
 *
 * function AdvancedChat() {
 *   const { status, messages, send, error } = useWebSocket<ChatMessage>(
 *     {
 *       url: "ws://localhost:3000/chat",
 *       autoReconnect: true,
 *       maxReconnectAttempts: 5,
 *       enableHeartbeat: true,
 *     },
 *     (message) => {
 *       console.log("Received:", message.data);
 *     },
 *     (event) => {
 *       console.log("Connected:", event);
 *     },
 *     (event) => {
 *       console.log("Disconnected:", event);
 *     },
 *     (event) => {
 *       console.log("Error:", event);
 *     }
 *   );
 *
 *   return (
 *     <div>
 *       <div>Status: {status}</div>
 *       {error && <div>Error: {error.type}</div>}
 *       {messages.map((msg, idx) => (
 *         <div key={idx}>
 *           <strong>{msg.data.sender}:</strong> {msg.data.message}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useWebSocket<T = unknown>(
  options: WebSocketOptions,
  onMessage?: (message: WebSocketMessage<T>) => void,
  onOpen?: (event: Event) => void,
  onClose?: (event: CloseEvent) => void,
  onError?: (event: Event) => void,
): WebSocketState<T> & WebSocketActions {
  const {
    url,
    protocols,
    autoReconnect = true,
    maxReconnectAttempts = 5,
    reconnectDelay = 1000,
    connectOnMount = true,
    heartbeatInterval = 30000,
    heartbeatMessage = "ping",
    enableHeartbeat = false,
    maxMessages = 1000,
  } = options;

  const [state, setState] = React.useState<WebSocketState<T>>({
    status: "closed",
    isConnected: false,
    lastMessage: null,
    messages: [],
    reconnectAttempts: 0,
    error: null,
  });

  // Refs to maintain stable references and avoid re-renders
  const socketRef = React.useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = React.useRef<number | null>(null);
  const heartbeatIntervalRef = React.useRef<number | null>(null);
  const reconnectAttemptsRef = React.useRef(0);

  // Store callbacks in refs to avoid dependency issues and re-renders
  const callbacksRef = React.useRef({
    onMessage,
    onOpen,
    onClose,
    onError,
  });

  // Update callbacks ref without causing re-renders
  React.useEffect(() => {
    callbacksRef.current = {
      onMessage,
      onOpen,
      onClose,
      onError,
    };
  });

  /**
   * Creates and manages the WebSocket connection
   * Uses useCallback to prevent unnecessary re-renders
   */
  const createConnection = React.useCallback(() => {
    // Prevent multiple connections
    if (
      socketRef.current &&
      socketRef.current.readyState !== WebSocket.CLOSED
    ) {
      return;
    }

    try {
      const ws = new WebSocket(url, protocols);
      socketRef.current = ws;

      setState((prev) => ({
        ...prev,
        status: "connecting",
        error: null,
      }));

      ws.onopen = (event) => {
        console.log("WebSocket connected");
        reconnectAttemptsRef.current = 0;

        setState((prev) => ({
          ...prev,
          status: "open",
          isConnected: true,
          reconnectAttempts: 0,
        }));

        callbacksRef.current.onOpen?.(event);

        // Start heartbeat if enabled
        if (enableHeartbeat) {
          heartbeatIntervalRef.current = window.setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(heartbeatMessage);
            }
          }, heartbeatInterval);
        }
      };

      ws.onmessage = (event) => {
        let parsedData: T;
        try {
          // Try to parse as JSON first
          parsedData = JSON.parse(event.data);
        } catch {
          // Fall back to raw data if not JSON
          parsedData = event.data as T;
        }

        const message: WebSocketMessage<T> = {
          data: parsedData,
          timestamp: Date.now(),
          // Extract type from message data if available
          type:
            typeof parsedData === "object" && parsedData !== null
              ? (parsedData as { type?: string }).type
              : undefined,
        };

        setState((prev) => ({
          ...prev,
          lastMessage: message,
          // Limit message history to prevent memory issues
          messages: [...prev.messages.slice(-(maxMessages - 1)), message],
        }));

        callbacksRef.current.onMessage?.(message);
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);

        // Clear heartbeat interval
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }

        setState((prev) => ({
          ...prev,
          status: "closed",
          isConnected: false,
        }));

        callbacksRef.current.onClose?.(event);

        // Attempt reconnection if auto-reconnect is enabled
        if (
          autoReconnect &&
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          reconnectAttemptsRef.current++;
          // Exponential backoff with maximum delay
          const delay = Math.min(
            reconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1),
            30000, // Max 30 seconds
          );

          reconnectTimeoutRef.current = window.setTimeout(() => {
            setState((prev) => ({
              ...prev,
              reconnectAttempts: reconnectAttemptsRef.current,
            }));
            createConnection();
          }, delay);
        }
      };

      ws.onerror = (event) => {
        console.error("WebSocket error:", event);

        setState((prev) => ({
          ...prev,
          error: event,
        }));

        callbacksRef.current.onError?.(event);
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setState((prev) => ({
        ...prev,
        error: error as Event,
      }));
    }
  }, [
    url,
    protocols,
    autoReconnect,
    maxReconnectAttempts,
    reconnectDelay,
    enableHeartbeat,
    heartbeatInterval,
    heartbeatMessage,
    maxMessages,
  ]);

  /**
   * Disconnects from the WebSocket and cleans up resources
   */
  const disconnect = React.useCallback(() => {
    // Clear reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Clear heartbeat interval
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    // Close WebSocket connection
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      status: "closed",
      isConnected: false,
    }));
  }, []);

  /**
   * Sends a message through the WebSocket connection
   * @param message - The message to send (will be JSON stringified if not a string)
   */
  const send = React.useCallback((message: unknown) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const messageString =
        typeof message === "string" ? message : JSON.stringify(message);
      socketRef.current.send(messageString);
    } else {
      console.warn("WebSocket is not connected. Cannot send message.");
    }
  }, []);

  /**
   * Clears all stored messages from the message history
   */
  const clearMessages = React.useCallback(() => {
    setState((prev) => ({
      ...prev,
      messages: [],
      lastMessage: null,
    }));
  }, []);

  /**
   * Manually triggers a reconnection attempt
   */
  const reconnect = React.useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    createConnection();
  }, [disconnect, createConnection]);

  /**
   * Manually connects to the WebSocket
   */
  const connect = React.useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    createConnection();
  }, [disconnect, createConnection]);

  // Initialize connection on mount and cleanup on unmount
  React.useEffect(() => {
    if (connectOnMount) {
      createConnection();
    }

    // Cleanup function to disconnect when component unmounts
    return () => {
      disconnect();
    };
  }, [connectOnMount, createConnection, disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    send,
    clearMessages,
    reconnect,
  };
}
