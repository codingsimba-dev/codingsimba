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
        "mx-auto flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-700",
        className,
      )}
    >
      {imageUrl ? (
        <div className="relative h-40 w-40">
          <img
            src={imageUrl || "https://placehold.co/400"}
            alt="empty state image"
            className="object-contain"
          />
        </div>
      ) : icon ? (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          {icon}
        </div>
      ) : null}

      <h3 className="mt-4 text-xl font-bold">{title}</h3>
      <p
        className={cn("mb-6 max-w-md text-gray-500 dark:text-gray-400", {
          "mb-0": !action,
        })}
      >
        {description}
      </p>
      {action ? <Button onClick={action.onClick}>{action.label}</Button> : null}
    </div>
  );
}
