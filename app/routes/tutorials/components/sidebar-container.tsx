import React from "react";
import type { Route } from "../+types/tutorial";
import { ChatBot } from "~/components/chatbot";
import { useLoaderData } from "react-router";

export function SideBarContainer({
  children,
  title,
  type,
}: {
  children: React.ReactNode;
  title: string;
  type?: "nav" | "default";
}) {
  const loaderData = useLoaderData<Route.ComponentProps["loaderData"]>();
  const { tutorial } = loaderData;
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="font-medium">{title}</h3>
        {type === "nav" ? <ChatBot item={tutorial} /> : null}
      </div>
      {children}
    </div>
  );
}
