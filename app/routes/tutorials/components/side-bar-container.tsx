import React from "react";
import { Button } from "~/components/ui/button";
import { Bot } from "lucide-react";
import { SheetTrigger } from "~/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

export function SideBarContainer({
  children,
  title,
  type,
}: {
  children: React.ReactNode;
  title: string;
  type?: "nav" | "default";
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="font-medium">{title}</h3>

        {type === "nav" ? (
          <SheetTrigger>
            <Tooltip>
              <TooltipTrigger>
                <div>
                  <Button variant="outline" size="icon" className="size-10">
                    <Bot className="size-6" />
                    <span className="sr-only">Chat with AI</span>
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Chat with your learning assistant</p>
              </TooltipContent>
            </Tooltip>
          </SheetTrigger>
        ) : null}
      </div>
      {children}
    </div>
  );
}
