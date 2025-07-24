import { useState } from "react";
import { createId as cuid } from "@paralleldrive/cuid2";
import { MessageCircle, Send, X, Minimize2, Maximize2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Textarea } from "./ui/textarea";
import { useOptionalUser, useUser } from "~/hooks/user";

interface Message {
  id: string;
  text: string;
  sender: "user" | "agent";
  timestamp: Date;
}

export function LiveChat() {
  const user = useOptionalUser();
  if (user) {
    return <Chat user={user} />;
  }
  return null;
}

function Chat({ user }: { user: ReturnType<typeof useUser> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: cuid(),
      text: `Hi ${user.name}! How can I help you today?`,
      sender: "agent",
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  function sendMessage() {
    if (newMessage.trim()) {
      const message: Message = {
        id: cuid(),
        text: newMessage,
        sender: "user",
        timestamp: new Date(),
      };
      setMessages([...messages, message]);
      setNewMessage("");

      setTimeout(() => {
        const agentResponse: Message = {
          id: cuid(),
          text: "Thanks for your message! Our team will get back to you shortly.",
          sender: "agent",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, agentResponse]);
      }, 3000);
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-primary hover:bg-primary/90 size-10 rounded-full p-0 shadow-lg"
      >
        <MessageCircle className="size-6" />
      </Button>
    );
  }

  return (
    <div className="w-80">
      <Card className="shadow-2xl">
        <CardHeader className="bg-primary text-primary-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="size-5" />
            <CardTitle className="text-lg">Live Chat</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-primary-foreground hover:bg-primary/80 size-8 p-0"
            >
              {isMinimized ? (
                <Maximize2 className="size-4" />
              ) : (
                <Minimize2 className="size-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-primary/80 size-8 p-0"
            >
              <X className="size-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0">
            <div className="flex h-80 flex-col">
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <p>{message.text}</p>
                      <p className="mt-1 text-xs opacity-70">
                        {formatDistanceToNow(message.timestamp, {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1"
                    rows={1}
                  />
                  <Button onClick={sendMessage} size="sm">
                    <Send className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
