import React from "react";
import type { Route } from "../routes/+types/chatbot";
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
import { useFetcher } from "react-router";
import { useIsPending } from "~/utils/misc";
import { FormError } from "./form-errors";
import { HoneypotInputs } from "remix-utils/honeypot/react";

type ChatBotProps = {
  documentId: string;
  documentTitle: string;
};

export function ChatBot({ documentId, documentTitle }: ChatBotProps) {
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
  const fetcher = useFetcher<Route.ComponentProps["actionData"]>();
  const answer = fetcher.data?.answer;
  const isLoading = useIsPending({
    formAction: fetcher.formAction,
    formMethod: fetcher.formMethod,
  });

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
          ) : answer ? (
            <Markdown source={answer} className="pt-0" />
          ) : (
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
                  <li>Understand complex concepts with clear explanations</li>
                  <li>
                    Provide examples or quizzes to reinforce your learning
                  </li>
                </ul>
              </p>
            </div>
          )}
        </div>
        <fetcher.Form
          method="post"
          action="/chatbot"
          className="mt-auto border-t border-gray-200 p-4"
        >
          <FormError
            errors={fetcher.data?.error ? fetcher.data.error.split(",") : []}
            className="-mt-2 mb-4"
          />
          <div className="flex items-center gap-2">
            <HoneypotInputs />
            <input type="hidden" name="documentId" value={documentId} />
            <Textarea
              name="question"
              placeholder="What learning challenge can I help you tackle?"
              className="flex-1"
              autoFocus
              ref={textAreaRef}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  textAreaRef.current?.form?.requestSubmit();
                }
              }}
            />
            <Tooltip>
              <TooltipTrigger>
                <Button
                  size="sm"
                  type="submit"
                  disabled={
                    isLoading || !textAreaRef.current?.value?.trim()?.length
                  }
                >
                  <Send className="size-4" />
                  <span className="sr-only">Send</span>
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
