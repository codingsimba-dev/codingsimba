import React from "react";
import { cn } from "~/utils/misc";

export function Container({
  title,
  description,
  className,
  children,
}: {
  title?: string;
  description?: string | React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "border-border bg-card rounded-xl border shadow-sm",
        className,
      )}
    >
      <div className="border-border border-b p-6">
        <h2 className="mb-2 text-xl font-bold">{title}</h2>
        {description ? <div>{description}</div> : null}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
