import React from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { useWebSocket } from "~/hooks/use-websocket";

interface ChatMessage {
  type: "chat";
  message: string;
  sender: string;
  timestamp: number;
}

interface SystemMessage {
  type: "system";
  message: string;
}

type WebSocketDemoMessage = ChatMessage | SystemMessage;

export function WebSocketDemo() {
  const [inputMessage, setInputMessage] = React.useState("");
  const [senderName, setSenderName] = React.useState("User");

  // Memoize callbacks to prevent re-renders
  const onMessage = React.useCallback(
    (message: {
      data: WebSocketDemoMessage;
      timestamp: number;
      type?: string;
    }) => {
      console.log("Received message:", message);
    },
    [],
  );

  const onOpen = React.useCallback((event: Event) => {
    console.log("WebSocket opened:", event);
  }, []);

  const onClose = React.useCallback((event: CloseEvent) => {
    console.log("WebSocket closed:", event);
  }, []);

  const onError = React.useCallback((event: Event) => {
    console.log("WebSocket error:", event);
  }, []);

  // Advanced WebSocket hook with full features
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
  } = useWebSocket<WebSocketDemoMessage>(
    {
      url: "ws://localhost:3001/ws",
      autoReconnect: true,
      maxReconnectAttempts: 5,
      reconnectDelay: 1000,
      enableHeartbeat: true,
      heartbeatInterval: 30000,
    },
    onMessage,
    onOpen,
    onClose,
    onError,
  );

  const handleSendMessage = () => {
    if (inputMessage.trim() && isConnected) {
      const message: ChatMessage = {
        type: "chat",
        message: inputMessage,
        sender: senderName,
        timestamp: Date.now(),
      };
      send(message);
      setInputMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-500";
      case "connecting":
        return "bg-yellow-500";
      case "closing":
        return "bg-orange-500";
      case "closed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="mt-20 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            WebSocket Demo
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={`${getStatusColor(status)} text-white`}
              >
                {status}
              </Badge>
              {reconnectAttempts > 0 && (
                <Badge variant="outline">Reconnects: {reconnectAttempts}</Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Controls */}
          <div className="flex gap-2">
            <Button
              onClick={connect}
              disabled={isConnected}
              variant="outline"
              size="sm"
            >
              Connect
            </Button>
            <Button
              onClick={disconnect}
              disabled={!isConnected}
              variant="outline"
              size="sm"
            >
              Disconnect
            </Button>
            <Button
              onClick={reconnect}
              disabled={isConnected}
              variant="outline"
              size="sm"
            >
              Reconnect
            </Button>
            <Button onClick={clearMessages} variant="outline" size="sm">
              Clear Messages
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-800">Error: {error.type}</p>
            </div>
          )}

          {/* Message Input */}
          <div className="space-y-2">
            <Input
              placeholder="Your name"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="max-w-xs"
            />
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                rows={2}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!isConnected || !inputMessage.trim()}
                className="self-end"
              >
                Send
              </Button>
            </div>
          </div>

          {/* Messages Display */}
          <div className="max-h-96 overflow-y-auto rounded-md border p-4">
            <h3 className="mb-2 font-semibold">Messages ({messages.length})</h3>
            {messages.length === 0 ? (
              <p className="text-sm text-gray-500">No messages yet</p>
            ) : (
              <div className="space-y-2">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className="rounded border bg-gray-50 p-2 text-sm"
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-medium">
                        {msg.data.type === "chat" ? msg.data?.sender : "System"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="mt-1">{msg.data.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Last Message */}
          {lastMessage && (
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
              <h4 className="mb-1 text-sm font-semibold">Last Message:</h4>
              <p className="text-sm">
                {lastMessage.data.type === "chat"
                  ? lastMessage.data.message
                  : lastMessage.data.message}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
