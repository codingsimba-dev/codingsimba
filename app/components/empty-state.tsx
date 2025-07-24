import type { ReactNode } from "react";
import { Button } from "~/components/ui/button";
import { cn } from "~/utils/misc";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  imageUrl?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  imageUrl,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "border-border mx-auto flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center",
        className,
      )}
    >
      {imageUrl ? (
        <div className="relative h-40 w-40">
          <img
            src={imageUrl}
            alt="empty state image"
            className="object-contain"
          />
        </div>
      ) : icon ? (
        <div className="bg-muted text-muted-foreground flex h-16 w-16 items-center justify-center rounded-full">
          {icon}
        </div>
      ) : null}

      <h3 className="mt-4 text-xl font-bold">{title}</h3>
      <p
        className={cn("text-muted-foreground mb-6 max-w-md", {
          "mb-0": !action,
        })}
      >
        {description}
      </p>
      {action ? <Button onClick={action.onClick}>{action.label}</Button> : null}
    </div>
  );
}
