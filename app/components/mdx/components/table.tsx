import { cn } from "~/utils/misc";

export function Table({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={cn(
        "w-full caption-bottom text-sm",
        "border-border border",
        "border-separate border-spacing-0",
        "overflow-hidden rounded-lg",
        className,
      )}
      {...props}
    />
  );
}

// Table Header
export function Thead({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn("border-border bg-muted border-b", className)}
      {...props}
    />
  );
}

// Table Body
export function Tbody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  );
}

// Table Row
export function Tr({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "border-border hover:bg-muted border-b transition-colors",
        className,
      )}
      {...props}
    />
  );
}

// Table Header Cell
export function Th({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "text-foreground h-12 px-4 text-left align-middle font-medium",
        className,
      )}
      {...props}
    />
  );
}

// Table Data Cell
export function Td({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("text-foreground p-4 align-middle", className)}
      {...props}
    />
  );
}

// Table Caption
export function Caption({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return (
    <caption
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}

// Table Footer
export function Tfoot({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tfoot className={cn("bg-muted font-medium", className)} {...props} />;
}
