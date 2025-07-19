import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

/**
 * Demo component: Connects to the WebSocket proxy server and streams updates to the UI.
 * Adjust the wsUrl as needed for your environment.
 */
export function RealtimeUpdatesDemo() {
  const [messages, setMessages] = React.useState<string[]>([]);
  const [input, setInput] = React.useState("");
  const wsRef = React.useRef<WebSocket | null>(null);
  const wsUrl = "ws://localhost:3001"; // Change to your proxy server URL/port

  React.useEffect(() => {
    const ws = new window.WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      ws.close();
    };
  }, [wsUrl]);

  const sendMessage = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(input);
      setInput("");
    }
  };

  return (
    <div className="border-border bg-card max-w-md rounded-lg border p-4">
      <h2 className="mb-4 text-lg font-semibold">Realtime Updates Demo</h2>
      <div className="mb-2 flex gap-2">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button onClick={sendMessage} disabled={!input}>
          Send
        </Button>
      </div>
      <div className="bg-muted max-h-48 overflow-y-auto rounded p-2">
        <ul className="space-y-1">
          {messages.map((msg, idx) => (
            <li key={idx} className="text-muted-foreground text-sm">
              {msg}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default RealtimeUpdatesDemo;
