import React from "react";
import { Badge } from "./ui/badge";
import { cn } from "~/utils/misc";

export function CardBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Badge
      className={cn(
        "border-primary/20 bg-primary text-primary-foreground absolute left-3 top-3 border",
        className,
      )}
    >
      {children}
    </Badge>
  );
}
