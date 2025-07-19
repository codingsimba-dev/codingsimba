import React from "react";
import type { Route } from "../routes/chat/+types/index";
import { Bot, Send } from "lucide-react";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Sheet,
} from "~/components/ui/sheet";
import { Markdown } from "~/components/mdx";
import { Textarea } from "~/components/ui/textarea";
import { Tooltip, TooltipContent } from "~/components/ui/tooltip";
import { TooltipTrigger } from "~/components/ui/tooltip";
import { Button } from "~/components/ui/button";
import { useFetcher, useLoaderData } from "react-router";
import { FormError } from "./form-errors";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { VisuallyHidden } from "./ui/visually-hidden";
import type { LessonConversation } from "~/routes/tutorials/lesson";

type ChatBotProps = {
  documentId: string;
  documentTitle: string;
};

export function ChatBot({ documentId, documentTitle }: ChatBotProps) {
  const [question, setQuestion] = React.useState("");
  const fetcher = useFetcher<Route.ComponentProps["actionData"]>();
  const answer = fetcher.data?.answer;
  const isLoading = fetcher.state !== "idle";
  const isError = !!fetcher.data?.error;
  const errors = fetcher.data?.error ? fetcher.data.error.split(",") : [];
  const { conversation } = useLoaderData<Route.ComponentProps["loaderData"]>();
  return (
    <Sheet>
      <Tooltip>
        <TooltipTrigger>
          <SheetTrigger>
            <div>
              <Button variant="outline" size="icon" className="size-10">
                <Bot className="size-6" />
                <span className="sr-only">Chat with AI</span>
              </Button>
            </div>
          </SheetTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Chat with your learning assistant</p>
        </TooltipContent>
      </Tooltip>
      <SheetContent className="lg:min-w-2xl min-w-[90%] sm:min-w-[80%] md:min-w-[70%]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bot className="size-6" />
            <span className="text-lg font-medium">
              Your 24/7 learning companion
            </span>
          </SheetTitle>
        </SheetHeader>
        <div className="-mt-6 flex flex-1 flex-col overflow-y-auto px-4">
          {isLoading ? (
            <LoadingSkeleton />
          ) : isError ? (
            <ErrorUI errors={errors} />
          ) : (
            <>
              {conversation ? (
                <ChatHistory conversation={conversation} />
              ) : null}
              {isLoading && question ? (
                <div className="mt-4">
                  <div className="flex items-start justify-end gap-2">
                    <div className="size-4" />
                    <div className="max-w-[80%] rounded-lg bg-blue-500 p-3 text-white">
                      {question}
                    </div>
                  </div>
                  <div className="mt-4 flex items-start gap-2">
                    <Bot className="mt-1 size-4" />
                    <div className="max-w-[80%] rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                      <LoadingMessage />
                    </div>
                  </div>
                </div>
              ) : null}
              {answer && !isLoading ? (
                <div className="mt-4">
                  <div className="flex items-start justify-end gap-2">
                    <div className="size-4" />
                    <div className="max-w-[80%] rounded-lg bg-blue-500 p-3 text-white">
                      {question}
                    </div>
                  </div>
                  <div className="mt-4 flex items-start gap-2">
                    <Bot className="mt-1 size-4" />
                    <div className="max-w-[80%] rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                      <Markdown source={answer} />
                    </div>
                  </div>
                </div>
              ) : null}
              {!conversation && !answer && (
                <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-6">
                  <Bot className="size-20" />
                  <p className="text-center text-lg font-medium text-gray-700 dark:text-gray-300">
                    Hi! I&apos;m here to support your learning journey in{" "}
                    <p className="font-bold">{documentTitle}</p>.
                  </p>
                  <p className="text-left text-sm text-gray-500 dark:text-gray-400">
                    I can help you:
                    <ul className="list-disc pl-5 text-gray-700 dark:text-gray-400">
                      <li>Connect ideas across different lessons</li>
                      <li>Work through practice problems together</li>
                      <li>
                        Understand complex concepts with clear explanations
                      </li>
                      <li>
                        Provide examples or quizzes to reinforce your learning
                      </li>
                    </ul>
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        <fetcher.Form
          method="post"
          action="/chatbot"
          className="mt-auto border-t border-gray-200 p-4"
        >
          <div className="flex items-center gap-2">
            <HoneypotInputs />
            <input type="hidden" name="documentId" value={documentId} />
            <Textarea
              name="question"
              placeholder="What learning challenge can I help you tackle?"
              className="flex-1"
              autoFocus
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  fetcher.submit({ documentId, question }, { method: "post" });
                  // setQuestion("");
                }
              }}
            />
            <Tooltip>
              <TooltipTrigger>
                <Button
                  size="sm"
                  type="submit"
                  disabled={isLoading || !question?.trim()?.length}
                  // onClick={() => setQuestion("")}
                >
                  <Send className="size-4" />
                  <VisuallyHidden>
                    {isLoading ? "Sending..." : "Send"}
                  </VisuallyHidden>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Send the question</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </fetcher.Form>
      </SheetContent>
    </Sheet>
  );
}

function ChatHistory({ conversation }: { conversation: LessonConversation }) {
  return (
    <ul className="flex flex-col gap-4">
      {conversation.messages.map((message) => (
        <li key={message.createdAt.toISOString()}>
          <div
            className={`flex items-start gap-2 ${message.role === "user" ? "justify-end" : ""}`}
          >
            {message.role === "assistant" && <Bot className="mt-1 size-4" />}
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              <Markdown source={message.content} />
            </div>
            {message.role === "user" && <div className="size-4" />}
          </div>
        </li>
      ))}
    </ul>
  );
}

function ErrorUI({ errors }: { errors: string[] }) {
  return (
    <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-6">
      <Bot className="size-20" />
      <FormError errors={errors} className="text-base" />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-6">
      <Bot className="size-20 animate-pulse" />
      <p className="text-center text-lg font-medium text-gray-700 dark:text-gray-300">
        Thinking...
      </p>
    </div>
  );
}

function LoadingMessage() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
      <div
        className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
        style={{ animationDelay: "0.1s" }}
      ></div>
      <div
        className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
        style={{ animationDelay: "0.2s" }}
      ></div>
    </div>
  );
}
