import { Bot, BrainCircuit, Send } from "lucide-react";
import { SheetContent, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import { Markdown } from "~/components/mdx";
import { Textarea } from "~/components/ui/textarea";
import { Tooltip, TooltipContent } from "~/components/ui/tooltip";
import { TooltipTrigger } from "~/components/ui/tooltip";
import { Button } from "~/components/ui/button";
import { type Tutorial } from "~/utils/content.server/turorials/types";

export function LearningAssistant({
  response,
  tutorial,
}: {
  response: string;
  tutorial: Tutorial;
}) {
  return (
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
        {response ? (
          <Markdown source={response} className="pt-0" />
        ) : (
          <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-6">
            <Bot className="size-20" />
            <p className="text-center text-lg font-medium text-gray-700 dark:text-gray-300">
              Hi! I&apos;m here to support your learning journey in{" "}
              <p className="font-bold">{tutorial.title}</p>.
            </p>
            <p className="text-left text-sm text-gray-500 dark:text-gray-400">
              I can help you:
              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-400">
                <li>Connect ideas across different lessons</li>
                <li>Work through practice problems together</li>
                <li>Understand complex concepts with clear explanations</li>
                <li>Provide examples or quizzes to reinforce your learning</li>
              </ul>
            </p>
          </div>
        )}
      </div>
      <div className="mt-auto flex items-center gap-2 border-t border-gray-200 p-4">
        <Textarea
          placeholder="How can I best support your learning right now?"
          className="flex-1"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <div className="flex flex-col items-center gap-2">
          <Tooltip>
            <TooltipTrigger>
              <Button size="sm">
                <Send className="size-4" />
                <span className="sr-only">Send</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Send the question</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Button size="sm">
                <BrainCircuit className="size-4" />
                <span className="sr-only">Reason</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reason about complex questions</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </SheetContent>
  );
}
