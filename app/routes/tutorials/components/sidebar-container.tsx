import React from "react";
import type { Route } from "../+types/tutorial";
import { ChatBot } from "~/components/chatbot";
import { useLoaderData } from "react-router";
import { cn } from "~/utils/misc";

export function SideBarContainer({
  children,
  title,
  type,
  className,
}: {
  children: React.ReactNode;
  title: string;
  type?: "nav" | "default";
  className?: string;
}) {
  const isNav = type === "nav";
  const { lesson } = useLoaderData<Route.ComponentProps["loaderData"]>();

  return (
    <div
      className={cn(
        "border-border overflow-hidden rounded-lg border",
        className,
      )}
    >
      <div className="border-border bg-muted flex items-center justify-between border-b p-3">
        <h3 className="font-medium">{title}</h3>
        {isNav && lesson ? (
          <ChatBot documentId={lesson.id} documentTitle={lesson.title} />
        ) : null}
      </div>
      {children}
    </div>
  );
}
