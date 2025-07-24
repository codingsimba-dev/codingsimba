import { cn } from "~/utils/misc";

export function Ul({
  className,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={cn(
        "text-foreground my-6 ml-6 list-disc [&>li]:mt-2",
        className,
      )}
      {...props}
    />
  );
}

export function Ol({
  className,
  ...props
}: React.HTMLAttributes<HTMLOListElement>) {
  return (
    <ol
      className={cn(
        "text-foreground my-6 ml-6 list-decimal [&>li]:mt-2",
        className,
      )}
      {...props}
    />
  );
}
