import React from "react";
import { Quote } from "lucide-react";
import { Link, type LinkProps } from "react-router";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/utils/misc";

import { Callout } from "~/components/ui/callout";

export function H1({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        "mb-6 mt-10 scroll-m-20 text-3xl font-bold tracking-normal lg:text-4xl",
        className,
      )}
      {...props}
    />
  );
}

export function H2({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "text-foreground scroll-m-20 text-3xl font-semibold tracking-tight",
        "border-border mb-4 mt-8",
        className,
      )}
      {...props}
    />
  );
}

export const H3 = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn(
      "text-foreground scroll-m-20 text-2xl font-semibold tracking-tight",
      "border-border mb-4 mt-8",
      className,
    )}
    {...props}
  />
);

export const H4 = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h4
    className={cn(
      "text-foreground scroll-m-20 text-xl font-semibold tracking-tight",
      "border-border mb-4 mt-8",
      className,
    )}
    {...props}
  />
);

export const H5 = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h5
    className={cn(
      "text-foreground scroll-m-20 text-lg font-semibold tracking-tight",
      "border-border mb-4 mt-8",
      className,
    )}
    {...props}
  />
);

export const H6 = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h6
    className={cn(
      "text-foreground scroll-m-20 text-lg font-semibold tracking-tight",
      "border-border mb-4 mt-8",
      className,
    )}
    {...props}
  />
);

export function P({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  if (React.isValidElement(children) && children.type === "img") {
    return <>{children}</>;
  }

  return (
    <p
      className={cn(
        "leading-7.5 text-foreground text-[1.05em] tracking-wide [&:not(:first-child)]:mt-6",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function Pre({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLPreElement>) {
  if (React.isValidElement(children)) {
    const childType = children.type;
    const childProps = children.props as { className?: string };

    if (
      childType === "iframe" ||
      childType === "img" ||
      (typeof childProps.className === "string" &&
        childProps.className.includes("mermaid")) ||
      (childType === "div" && childProps.className?.includes("no-pre"))
    ) {
      return <>{children}</>;
    }
  }

  return (
    <pre className={cn("p-0", className)} {...props}>
      {children}
    </pre>
  );
}

type CalloutVariant = "tip" | "caution" | "danger";

interface TitleChildProps {
  className?: string;
  children?: React.ReactNode;
}

export function Div({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const childrenArray = React.Children.toArray(children);

  const titleChild = childrenArray.find((child: React.ReactNode) => {
    if (!React.isValidElement<TitleChildProps>(child)) return false;
    return (
      typeof child.props.className === "string" &&
      child.props.className.includes("remark-container-title")
    );
  });

  const contentChildren = childrenArray.filter((child) => child !== titleChild);

  const variant = React.isValidElement<TitleChildProps>(titleChild)
    ? ((titleChild.props.className?.match(
        /tip|caution|danger/,
      )?.[0] as CalloutVariant) ?? "tip")
    : null;

  if (variant) {
    return (
      <Callout
        variant={variant}
        title={variant}
        className={cn("my-8", className)}
        {...props}
      >
        {contentChildren}
      </Callout>
    );
  }

  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  );
}

export function Subtle({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export function Blockquote({
  className,
  ...props
}: React.HTMLAttributes<HTMLQuoteElement>) {
  return (
    <div className="relative">
      <Quote className="text-muted-foreground absolute -top-2 left-2 size-4" />
      <blockquote
        className={cn(
          "text-muted-foreground pl-8 italic",
          "border-border border-l-4",
          "relative overflow-visible",
          className,
        )}
        {...props}
      />
    </div>
  );
}

interface AProps extends LinkProps {
  className?: string;
  to: string;
}

export function A({ className, to: href, ...props }: AProps) {
  const target = href?.startsWith("http") ? "_blank" : undefined;
  const rel = href?.startsWith("http") ? "noopener noreferrer" : undefined;

  return (
    <Link
      to={href || "#"}
      prefetch="intent"
      target={target}
      rel={rel}
      className={cn(
        "font-medium text-blue-600 underline-offset-4 hover:underline dark:text-blue-400",
        className,
      )}
      {...props}
    />
  );
}

export function Hr({ className, ...props }: { className?: string }) {
  return <Separator className={cn("my-2", className)} {...props} />;
}
