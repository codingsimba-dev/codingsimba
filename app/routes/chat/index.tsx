import { useState, useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import {
  Bot,
  User,
  Lightbulb,
  BookOpen,
  Code,
  Plus,
  MessageSquare,
  Bug,
  Briefcase,
  FileText,
  Layers,
} from "lucide-react";
import { format } from "date-fns";
import { ChatSidebar } from "./components/sidebar";
import { Textarea } from "~/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Badge } from "~/components/ui/badge";

import { AuthButtons } from "~/components/navbar";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isTyping?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
}

type LearningMode =
  | "analyse-code"
  | "create-tutorial"
  | "explain-or-design-algorithm"
  | "debug-code"
  | "career-advice"
  | "system-design"
  | "analyze-algorithm"
  | "code-review"
  | null;

const sampleConversations: Conversation[] = [
  {
    id: "1",
    title: "Quantum Computing Basics",
    messages: [
      {
        id: "1",
        content: "Hello! I'm your AI assistant. How can I help you today?",
        role: "assistant",
        timestamp: new Date(Date.now() - 300000),
      },
      {
        id: "2",
        content: "Can you explain quantum computing in simple terms?",
        role: "user",
        timestamp: new Date(Date.now() - 240000),
      },
      {
        id: "3",
        content:
          "Quantum computing is a revolutionary approach to computation that harnesses the principles of quantum mechanics. Unlike classical computers that use bits (0s and 1s), quantum computers use quantum bits or \"qubits\" that can exist in multiple states simultaneously through a property called superposition.\n\nThink of it like this: while a classical bit is like a coin that's either heads or tails, a qubit is like a spinning coin that's both heads and tails until it lands. This allows quantum computers to process many possibilities at once, making them potentially much faster for certain types of problems.",
        role: "assistant",
        timestamp: new Date(Date.now() - 180000),
      },
      {
        id: "4",
        content: "That's fascinating! What are some practical applications?",
        role: "user",
        timestamp: new Date(Date.now() - 120000),
      },
      {
        id: "5",
        content:
          "Great question! Quantum computing has several exciting practical applications:\n\n• **Drug Discovery**: Simulating molecular interactions to develop new medicines faster\n• **Cryptography**: Both breaking current encryption and creating quantum-safe security\n• **Financial Modeling**: Optimizing portfolios and risk analysis\n• **Weather Prediction**: Processing vast amounts of atmospheric data\n• **Artificial Intelligence**: Accelerating machine learning algorithms\n• **Supply Chain Optimization**: Solving complex logistics problems\n\nWhile we're still in the early stages, companies like IBM, Google, and others are making significant progress in making quantum computing more accessible.",
        role: "assistant",
        timestamp: new Date(Date.now() - 60000),
      },
    ],
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: "2",
    title: "JavaScript Best Practices",
    messages: [
      {
        id: "6",
        content: "What are some JavaScript best practices I should follow?",
        role: "user",
        timestamp: new Date(Date.now() - 900000),
      },
      {
        id: "7",
        content:
          "Here are some essential JavaScript best practices:\n\n**Code Quality:**\n• Use `const` and `let` instead of `var`\n• Use meaningful variable names\n• Keep functions small and focused\n• Use async/await instead of callbacks\n\n**Performance:**\n• Avoid global variables\n• Use event delegation for DOM events\n• Minimize DOM manipulation\n• Use efficient array methods (map, filter, reduce)\n\n**Security:**\n• Validate all user inputs\n• Use strict mode\n• Avoid eval() and innerHTML with user data\n• Use HTTPS for all network requests",
        role: "assistant",
        timestamp: new Date(Date.now() - 880000),
      },
    ],
    timestamp: new Date(Date.now() - 900000),
  },
];

// Group conversations by date

export default function ChatbotPage() {
  const [conversations, setConversations] =
    useState<Conversation[]>(sampleConversations);
  const [activeConversationId, setActiveConversationId] = useState<string>("1");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [learningMode, setLearningMode] = useState<LearningMode>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );
  const messages = activeConversation?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "New conversation",
      messages: [
        {
          id: Date.now().toString(),
          content:
            "Hello! I'm your Software Development AI assistant. How can I help you today?",
          role: "assistant",
          timestamp: new Date(),
        },
      ],
      timestamp: new Date(),
    };

    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
  };

  const deleteConversation = (conversationId: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    if (activeConversationId === conversationId) {
      const remaining = conversations.filter((c) => c.id !== conversationId);
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
      } else {
        createNewConversation();
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    // Update conversation with user message
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversationId
          ? {
              ...conv,
              messages: [...conv.messages, userMessage],
              title:
                conv.messages.length === 1 ? input.slice(0, 50) : conv.title,
            }
          : conv,
      ),
    );

    setInput("");
    setIsLoading(true);

    // Simulate AI response with typing effect
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(userMessage.content, learningMode),
        role: "assistant",
        timestamp: new Date(),
      };

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? { ...conv, messages: [...conv.messages, assistantMessage] }
            : conv,
        ),
      );

      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (
    userInput: string,
    mode: LearningMode,
  ): string => {
    let modeSpecificResponse = "";

    switch (mode) {
      case "analyse-code":
        modeSpecificResponse =
          "Let me analyze this code for you. I'll examine the structure, identify potential issues, and suggest improvements:\n\n";
        break;
      case "create-tutorial":
        modeSpecificResponse =
          "I'll create a step-by-step tutorial for you. Here's how we can break this down into learning modules:\n\n";
        break;
      case "explain-or-design-algorithm":
        modeSpecificResponse =
          "Let me explain this algorithm in detail, including its time complexity, use cases, and implementation:\n\n";
        break;
      default:
        modeSpecificResponse = "";
    }

    const baseResponses = [
      "That's an interesting question! Let me help you understand this concept better...",
      "I'd be happy to explain that. Here's what you need to know...",
      "Great question! This is actually a fascinating topic...",
      "Let me break this down for you in a simple way...",
      "I can definitely help with that. Here's my detailed explanation...",
    ];

    return (
      modeSpecificResponse +
      baseResponses[Math.floor(Math.random() * baseResponses.length)] +
      "\n\nThis is a simulated response. In a real implementation, this would connect to an AI service like OpenAI, Anthropic, or another provider to generate intelligent responses based on your specific question and selected learning mode."
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getPlaceholderText = () => {
    switch (learningMode) {
      case "analyse-code":
        return "Paste your code here for analysis...";
      case "create-tutorial":
        return "What topic would you like a tutorial on?";
      case "explain-or-design-algorithm":
        return "Which algorithm would you like me to explain?";
      default:
        return "Type your message...";
    }
  };

  const getLearningModeInfo = (mode: LearningMode) => {
    switch (mode) {
      case "analyse-code":
        return {
          label: "Analyse Code",
          icon: Code,
          description: "Get code reviews and suggestions",
        };
      case "create-tutorial":
        return {
          label: "Create Tutorial",
          icon: BookOpen,
          description: "Generate step-by-step learning guides",
        };
      case "explain-or-design-algorithm":
        return {
          label: "Explain or Design Algorithm",
          icon: Lightbulb,
          description: "Understand algorithms and data structures",
        };
      default:
        return null;
    }
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [textareaHeight, setTextareaHeight] = useState(60);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      // Reset height to get correct scrollHeight
      textareaRef.current.style.height = "auto";
      // Calculate new height (clamped between min and max)
      const newHeight = Math.min(
        Math.max(textareaRef.current.scrollHeight, 60), // min 60px
        200, // max 200px
      );
      // Only update if height changed
      if (newHeight !== textareaHeight) {
        setTextareaHeight(newHeight);
      }
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        <SidebarProvider>
          <ChatSidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onConversationSelect={setActiveConversationId}
            onNewConversation={createNewConversation}
            onDeleteConversation={deleteConversation}
          />

          {/* Main Chat Area */}
          <div className="mb-32 mt-14 flex min-w-0 flex-1 flex-col">
            {/* Chat Header */}
            <div
              style={{
                left: "calc(var(--sidebar-width))",
                width: "calc(100% - var(--sidebar-width))",
                right: "0",
              }}
              className="bg-card/50 fixed top-0 z-30 flex items-center justify-between gap-6 border-b px-6 py-2"
            >
              <div className="flex items-center gap-4">
                <SidebarTrigger className="h-8 w-8" />
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h1 className="font-semibold">
                    {activeConversation?.title || "AI Assistant"}
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    {format(new Date(), "HH:mm")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 md:gap-12">
                <div className="flex flex-wrap gap-2">
                  {/* Primary Mode - Always Visible */}
                  <Button
                    variant={learningMode === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLearningMode(null)}
                    className="gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    General Chat
                  </Button>

                  {/* Visual Separator */}
                  <div className="bg-muted w-px" />

                  {/* Specialized Modes */}
                  <Button
                    variant={
                      learningMode === "code-review" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setLearningMode(
                        learningMode === "code-review" ? null : "code-review",
                      )
                    }
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Code Review
                  </Button>

                  {/* More Options Dropdown - For Additional Features */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        More
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setLearningMode("debug-code")}
                      >
                        <Bug className="mr-2 h-4 w-4" />
                        Debug Code
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setLearningMode("analyse-code")}
                      >
                        <Code className="mr-2 h-4 w-4" />
                        Analyze Code
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          setLearningMode("explain-or-design-algorithm")
                        }
                      >
                        <Lightbulb className="mr-2 h-4 w-4" />
                        Explain/Design Algorithm
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setLearningMode("career-advice")}
                      >
                        <Briefcase className="mr-2 h-4 w-4" />
                        Career Advice
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setLearningMode("system-design")}
                      >
                        <Layers className="mr-2 h-4 w-4" />
                        System Design
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => setLearningMode("create-tutorial")}
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        Tutorial
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <AuthButtons />
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <div className="mx-auto max-w-4xl space-y-6">
                    {messages.length === 0 ? (
                      <div className="text-muted-foreground py-12 text-center">
                        <Bot className="mx-auto mb-4 h-12 w-12 opacity-50" />
                        <h3 className="mb-2 text-lg font-medium">
                          Start a conversation
                        </h3>
                        <p>Ask me anything and I&apos;ll do my best to help!</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          {message.role === "assistant" && (
                            <Avatar className="mt-1 h-8 w-8">
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                <Bot className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                          )}

                          <div
                            className={`max-w-[85%] rounded-2xl px-3 py-2 sm:max-w-[80%] sm:px-4 sm:py-3 ${
                              message.role === "user"
                                ? "bg-muted text-foreground shadow-md" // User: Uses your theme primary
                                : "bg-card border-border text-card-foreground border shadow-sm" // Assistant: Theme-aware
                            }`}
                          >
                            <div className="whitespace-pre-wrap leading-relaxed">
                              {message.content}
                            </div>
                            <div
                              className={`mt-2 ${
                                message.role === "user"
                                  ? "text-foreground/70"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {format(message.timestamp, "HH:mm")}
                            </div>
                          </div>

                          {message.role === "user" && (
                            <Avatar className="mt-1 h-8 w-8">
                              <AvatarFallback className="bg-muted">
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))
                    )}

                    {/* Typing Indicator */}
                    {isLoading ? (
                      <div className="flex justify-start gap-4">
                        <Avatar className="mt-1 h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-card flex items-center gap-2 rounded-2xl border px-4 py-3 shadow-sm">
                          <div className="animate-pulse text-xs">Thinking</div>
                          <div className="flex items-center gap-1">
                            <div className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full"></div>
                            <div className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full [animation-delay:0.1s]"></div>
                            <div className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full [animation-delay:0.2s]"></div>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {/* Scroll anchor */}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* Input Area */}
            <div
              style={{
                left: "var(--sidebar-width)",
                right: "0",
              }}
              className="bg-card fixed bottom-2 left-0 right-0 mx-auto w-full max-w-3xl rounded-2xl border border-t p-2 shadow-lg"
            >
              <div className="mx-auto max-w-3xl">
                {learningMode && (
                  <div className="text-muted-foreground mb-3 flex items-center gap-2 text-sm">
                    {(() => {
                      const modeInfo = getLearningModeInfo(learningMode);
                      const Icon = modeInfo?.icon;
                      return Icon ? (
                        <Badge variant={"secondary"} className="p-2">
                          <Icon className="size-4" />
                        </Badge>
                      ) : null;
                    })()}
                    <span>
                      {getLearningModeInfo(learningMode)?.label} mode active
                    </span>
                  </div>
                )}
                <div className="flex items-end gap-2 px-4 pb-2">
                  <div
                    className="relative flex-1 rounded-2xl bg-white shadow-sm transition-all duration-200 dark:bg-gray-800"
                    style={{
                      maxHeight: textareaHeight > 200 ? "200px" : "none",
                      overflow: "hidden",
                    }}
                  >
                    <Textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        adjustTextareaHeight();
                      }}
                      onPaste={() => {
                        setTimeout(adjustTextareaHeight, 0); // Async to allow paste completion
                      }}
                      placeholder="Ask anything about software engineering..."
                      className="w-full resize-none border-none bg-transparent py-3 pl-4 pr-16 text-base outline-none"
                      style={{
                        height: `${textareaHeight}px`,
                        minHeight: "60px",
                        maxHeight: "200px",
                        transition: "height 0.2s ease-out",
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      disabled={isLoading}
                      rows={1}
                    />
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      {/* File Upload Button */}
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        // onClick={handleFileUpload}
                        disabled={isLoading}
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                          />
                        </svg>
                      </button>

                      {/* Search Button (appears when search terms detected) */}
                      {/* shouldShowSearchButton(input) */}
                      {/* eslint-disable-next-line no-constant-binary-expression */}
                      {true && (
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900"
                          // onClick={handleWebSearch}
                          disabled={isLoading}
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </button>
                      )}

                      {/* Send Button */}
                      <button
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${input.trim() ? "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900" : "text-gray-400"}`}
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground text-center text-xs">
                  AI can make mistakes. Consider checking important information.
                </p>
              </div>
            </div>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
}

// export default function ChatRoute() {
//   const location = useLocation();
//   console.log(location);

//   return <div>some</div>;
// }
